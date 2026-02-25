document.addEventListener("DOMContentLoaded", function() {
  // SCORM init (safe)
  try { initSCORM(); } catch(e) {}

  // === COVER PAGE ===
  var cover = document.getElementById("coverPage");
  var coverBtn = document.getElementById("coverStartBtn");
  var coverGrid = document.getElementById("coverGrid");

  if (coverBtn) {
    coverBtn.onclick = function() {
      if (cover) { cover.style.opacity = "0"; cover.style.pointerEvents = "none"; }
      setTimeout(function() { if (cover) cover.style.display = "none"; }, 500);
    };
  }

  if (coverGrid) {
    var gs = 20;
    var cols = ["#0071e3","#5ac8fa","#7B2FFF","#34c759"];
    coverGrid.style.gridTemplateColumns = "repeat("+gs+",1fr)";
    coverGrid.style.gridTemplateRows = "repeat("+gs+",1fr)";
    for (var i=0; i<gs*gs; i++) { var d=document.createElement("div"); d.className="pixel"; coverGrid.appendChild(d); }
    document.addEventListener("mousemove", function(e) {
      if (!coverGrid || cover.style.display==="none") return;
      var r=coverGrid.getBoundingClientRect();
      var c=Math.floor((e.clientX-r.left)/(r.width/gs));
      var row=Math.floor((e.clientY-r.top)/(r.height/gs));
      var idx=row*gs+c;
      var px=coverGrid.children[idx];
      if(px&&!px.dataset.lit){px.dataset.lit="1";px.style.background=cols[Math.floor(Math.random()*4)];px.style.opacity="0.8";
        setTimeout(function(){px.style.background="";px.style.opacity="";delete px.dataset.lit;},700);}
    });
  }

  // === NAVIGATION ===
  var totalSteps = document.querySelectorAll(".step-container").length;
  var cur = 0;
  var done = {};
  var score = 0, total = 0, weak = [];

  function go(idx) {
    if (idx<0||idx>=totalSteps) return;
    cur = idx;
    document.querySelectorAll(".step-container").forEach(function(el,i) { el.style.display = i===idx ? "block" : "none"; });
    var prev = document.getElementById("prevBtn");
    var next = document.getElementById("nextBtn");
    if (prev) prev.disabled = idx===0;
    if (next) next.textContent = idx===totalSteps-1 ? "Terminer" : "Suivant \u2192";
    done[idx] = true;
    // Progress
    var pct = Math.round(Object.keys(done).length/totalSteps*100);
    document.querySelectorAll(".progress-bar-fill").forEach(function(b){b.style.width=pct+"%";});
    // Breadcrumb
    document.querySelectorAll(".breadcrumb-link").forEach(function(l,i){
      l.style.fontWeight = i===idx?"700":"500";
      l.style.color = i===idx?"#1d1d1f" : done[i]?"#34c759":"#86868b";
    });
    // Animate in
    window.scrollTo({top:0});
    document.querySelectorAll(".step-container[style*='block'] .animate-in").forEach(function(el,i){
      setTimeout(function(){el.style.opacity="1";el.style.transform="translateY(0)";},i*80);
    });
    // Counters
    document.querySelectorAll(".step-container[style*='block'] .counter-num[data-target]").forEach(function(el){
      if(el.dataset.done) return; el.dataset.done="1";
      var t=parseFloat(el.dataset.target),s=el.dataset.suffix||"",p=el.dataset.prefix||"",st=null;
      (function tick(ts){if(!st)st=ts;var pr=Math.min((ts-st)/1500,1);var v=Math.floor(pr*t);
        if(pr<1&&Math.random()>0.85)v+=Math.floor(Math.random()*5);
        if(v>t)v=t;el.textContent=p+v+s;if(pr<1)requestAnimationFrame(tick);else el.textContent=p+Math.round(t)+s;})(performance.now());
    });
    // Typewriter
    document.querySelectorAll(".step-container[style*='block'] [data-typewriter]").forEach(function(el){
      if(el.dataset.twDone) return; el.dataset.twDone="1";
      var txt=el.textContent; el.textContent="";
      var ci=0;
      (function tw(){if(ci<=txt.length){el.textContent=txt.slice(0,ci);ci++;setTimeout(tw,50);}})();
    });
    try{setSCORMLocation(idx);}catch(e){}
    if(Object.keys(done).length===totalSteps){try{setSCORMComplete();}catch(e){}}
  }

  document.getElementById("prevBtn").onclick = function(){go(cur-1);};
  document.getElementById("nextBtn").onclick = function(){ if(cur===totalSteps-1){showCompletion();}else{go(cur+1);} };
  document.querySelectorAll(".breadcrumb-link").forEach(function(l){
    l.onclick = function(){go(parseInt(l.dataset.step));};
  });

  // === ACCORDIONS ===
  document.querySelectorAll(".accordion-header").forEach(function(h){
    h.onclick = function(){
      var item=h.parentElement;
      var was=item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item").forEach(function(a){a.classList.remove("open");});
      if(!was)item.classList.add("open");
    };
  });

  // === FLIP CARDS ===
  document.querySelectorAll(".flip-card").forEach(function(card){
    card.addEventListener("click", function(e){
      e.stopPropagation();
      card.classList.toggle("flipped");
    }, true);
  });

  // === TABS ===
  document.querySelectorAll(".tab-btn").forEach(function(btn){
    btn.onclick = function(){
      var ct=btn.closest(".tabs-container"), tgt=btn.dataset.tab;
      ct.querySelectorAll(".tab-btn").forEach(function(b){b.classList.toggle("active",b===btn);});
      ct.querySelectorAll(".tab-panel").forEach(function(p){p.classList.toggle("active",p.dataset.tab===tgt);});
    };
  });

  // === DND ===
  document.querySelectorAll(".dnd-container").forEach(function(ct){
    var dragEl=null;
    ct.querySelectorAll(".dnd-sources .dnd-item").forEach(function(item){
      item.ondragstart=function(e){dragEl=item;item.style.opacity="0.3";e.dataTransfer.setData("text","x");};
      item.ondragend=function(){item.style.opacity="";};
    });
    ct.querySelectorAll(".dnd-zone").forEach(function(zone){
      zone.ondragover=function(e){e.preventDefault();zone.style.borderColor="#0071e3";};
      zone.ondragleave=function(){zone.style.borderColor="";};
      zone.ondrop=function(e){e.preventDefault();zone.style.borderColor="";if(dragEl){var cl=dragEl.cloneNode(true);zone.appendChild(cl);dragEl.style.opacity="0.2";dragEl.style.pointerEvents="none";dragEl=null;}};
    });
    var checkBtn=ct.querySelector(".dnd-check-btn");
    if(checkBtn) checkBtn.onclick=function(){
      var ok=0,tot=0;
      ct.querySelectorAll(".dnd-zone").forEach(function(z){z.querySelectorAll(".dnd-item").forEach(function(it){
        tot++;if(it.dataset.zone===z.dataset.zone){ok++;it.style.borderColor="#34c759";}else{it.style.borderColor="#ff3b30";}
      });});
      total+=tot;score+=ok;
      var fb=ct.querySelector(".dnd-feedback");
      if(fb){fb.style.display="block";fb.textContent=ok===tot?"\u2705 Parfait !":"\u274C "+ok+"/"+tot+" correct(s)";fb.style.background=ok===tot?"rgba(52,199,89,0.06)":"rgba(255,59,48,0.06)";}
      checkBtn.disabled=true;
    };
  });

  // === MATCHING ===
  document.querySelectorAll(".matching-container").forEach(function(ct){
    var sel=null;
    ct.querySelectorAll(".match-left .match-item").forEach(function(l){
      l.onclick=function(){if(l.classList.contains("matched"))return;ct.querySelectorAll(".match-left .match-item").forEach(function(x){x.style.outline="";});l.style.outline="2px solid #0071e3";sel=l;};
    });
    ct.querySelectorAll(".match-right .match-item").forEach(function(r){
      r.onclick=function(){if(!sel||r.classList.contains("matched"))return;total++;
        if(sel.dataset.match===r.dataset.match){score++;sel.classList.add("matched");r.classList.add("matched");sel.style.outline="";sel.style.borderColor="#34c759";r.style.borderColor="#34c759";}
        else{sel.style.borderColor="#ff3b30";r.style.borderColor="#ff3b30";setTimeout(function(){sel.style.borderColor="";r.style.borderColor="";sel.style.outline="";},600);}
        sel=null;
      };
    });
  });

  // === SCENARIO ===
  document.querySelectorAll(".scenario-container").forEach(function(ct){
    var nodes=ct.querySelectorAll(".scenario-node");
    ct.querySelectorAll(".scenario-choice").forEach(function(ch){
      ch.onclick=function(){
        var node=ch.closest(".scenario-node");if(node.dataset.done)return;node.dataset.done="1";
        var pts=parseInt(ch.dataset.points)||0;total+=2;score+=pts;
        ch.style.borderColor=pts>=2?"#34c759":pts>=1?"#ff9f0a":"#ff3b30";
        ch.style.background=pts>=2?"rgba(52,199,89,0.06)":pts>=1?"rgba(255,159,10,0.06)":"rgba(255,59,48,0.06)";
        var res=node.querySelector(".scenario-result");
        if(res){res.style.display="block";res.textContent=ch.dataset.feedback;res.style.background=ch.style.background;}
        var nx=parseInt(ch.dataset.next);
        if(!isNaN(nx)&&nodes[nx])setTimeout(function(){nodes[nx].style.display="block";},800);
      };
    });
  });

  // === QUIZ ===
  document.querySelectorAll(".quiz-question").forEach(function(q){
    var selOpt=null;
    q.querySelectorAll(".quiz-option").forEach(function(o){
      o.onclick=function(){if(q.dataset.done)return;q.querySelectorAll(".quiz-option").forEach(function(x){x.style.borderColor="";x.style.background="";});
        o.style.borderColor="#0071e3";o.style.background="rgba(0,113,227,0.04)";selOpt=o;
        var btn=q.querySelector(".quiz-validate-btn");if(btn)btn.disabled=false;};
    });
    var vbtn=q.querySelector(".quiz-validate-btn");
    if(vbtn) vbtn.onclick=function(){
      if(!selOpt||q.dataset.done)return;q.dataset.done="1";total++;
      var ok=selOpt.dataset.correct==="true";
      if(ok){score++;selOpt.style.borderColor="#34c759";selOpt.style.background="rgba(52,199,89,0.06)";}
      else{selOpt.style.borderColor="#ff3b30";selOpt.style.background="rgba(255,59,48,0.06)";q.querySelectorAll(".quiz-option[data-correct='true']").forEach(function(c){c.style.borderColor="#34c759";c.style.background="rgba(52,199,89,0.06)";});}
      var fb=q.querySelector(".quiz-feedback");
      if(fb){fb.style.display="block";fb.textContent=ok?("\u2705 "+fb.dataset.correctText):("\u274C "+fb.dataset.incorrectText);fb.style.background=ok?"rgba(52,199,89,0.06)":"rgba(255,59,48,0.06)";}
      vbtn.disabled=true;
    };
  });

  // === VRAI/FAUX ===
  document.querySelectorAll(".vf-btn").forEach(function(btn){
    btn.onclick=function(){
      var item=btn.closest(".vf-item");if(item.classList.contains("answered"))return;item.classList.add("answered");
      var isV=btn.dataset.answer==="vrai",correct=item.dataset.correct==="vrai",ok=isV===correct;
      total++;if(ok)score++;
      btn.style.background=ok?"#34c759":"#ff3b30";btn.style.color="#fff";
      item.style.borderColor=ok?"#34c759":"#ff3b30";
      var fb=item.querySelector(".vf-feedback");if(fb){fb.style.display="block";}
    };
  });

  // === REVEAL CARDS ===
  document.querySelectorAll(".reveal-card").forEach(function(c){
    c.onclick=function(){if(c.classList.contains("revealed"))return;c.classList.add("revealed");c.textContent=c.dataset.content;};
  });

  // === FILL BLANKS ===
  document.querySelectorAll(".blanks-container").forEach(function(ct){
    var activeSlot=null;
    ct.querySelectorAll(".blank-slot").forEach(function(s){s.onclick=function(){activeSlot=s;ct.querySelectorAll(".blank-slot").forEach(function(x){x.style.outline="";});s.style.outline="2px solid #0071e3";};});
    ct.querySelectorAll(".blank-option").forEach(function(o){
      o.onclick=function(){if(!activeSlot||o.classList.contains("used"))return;activeSlot.textContent=o.textContent;o.classList.add("used");total++;
        if(activeSlot.dataset.answer===o.dataset.value){score++;activeSlot.style.color="#34c759";activeSlot.style.borderColor="#34c759";}
        else{activeSlot.style.color="#ff3b30";activeSlot.style.borderColor="#ff3b30";}
        activeSlot.style.outline="";activeSlot=null;};
    });
  });

  // === DEBATE ===
  document.querySelectorAll(".debate-side").forEach(function(s){
    s.onclick=function(){var ct=s.closest(".debate-container");if(ct.dataset.done)return;ct.dataset.done="1";
      s.style.borderColor="#0071e3";s.style.background="rgba(0,113,227,0.04)";
      var rv=ct.querySelector(".debate-reveal");if(rv)rv.style.display="block";};
  });

  // === CHECKLIST ===
  document.querySelectorAll(".checklist-item").forEach(function(it){
    it.onclick=function(){it.classList.toggle("checked");
      var ct=it.closest(".checklist-container"),n=ct.querySelectorAll(".checklist-item.checked").length,t=ct.querySelectorAll(".checklist-item").length;
      var pr=ct.querySelector(".checklist-progress");if(pr)pr.textContent=n+"/"+t+" engagements pris";};
  });

  // === SLIDER ===
  document.querySelectorAll(".slider-container input[type=range]").forEach(function(s){
    var d=s.parentElement.querySelector(".slider-value");
    var msgs=["Débutant","Notions de base","Intermédiaire","Avancé","Expert"];
    s.oninput=function(){if(d)d.textContent=s.value+"/5 - "+msgs[parseInt(s.value)-1];};
  });

  // === SCORE DISPLAY ===
  // (updated when navigating to synthesis step)

  
  // SCROLL HINT - hide when user scrolls
  var scrollHint = document.getElementById("scrollHint");
  if (scrollHint) {
    window.addEventListener("scroll", function() {
      if (window.scrollY > 80) scrollHint.classList.add("hidden");
      else scrollHint.classList.remove("hidden");
    });
  }

  
  // NEXT STEP CTA at bottom of each step
  var labels = [];
  document.querySelectorAll(".breadcrumb-link").forEach(function(l) {
    labels.push(l.textContent.trim());
  });
  document.querySelectorAll(".step-container").forEach(function(step, idx) {
    if (idx >= totalSteps - 1) return; // skip last step
    var nextLabel = labels[idx + 1] || "suivante";
    var cta = document.createElement("div");
    cta.className = "step-next-cta";
    cta.innerHTML = "<p>Vous avez terminé cette section</p><button class='step-next-btn' data-goto='" + (idx+1) + "'>Étape suivante : " + nextLabel + " <span class='arrow'>&#8594;</span></button>";
    step.appendChild(cta);
  });
  document.querySelectorAll(".step-next-btn").forEach(function(btn) {
    btn.onclick = function() { go(parseInt(btn.dataset.goto)); };
  });

  
  // COMPLETION PAGE
  var compPage = document.getElementById("completionPage");
  var compGrid = document.getElementById("completionGrid");
  var compClose = document.getElementById("completionCloseBtn");

  if (compGrid && compPage) {
    var gs2 = 20;
    var cols2 = ["#0071e3","#5ac8fa","#34c759","#5856d6"];
    compGrid.style.gridTemplateColumns = "repeat("+gs2+",1fr)";
    compGrid.style.gridTemplateRows = "repeat("+gs2+",1fr)";
    for (var j=0; j<gs2*gs2; j++) { var d=document.createElement("div"); d.className="pixel"; compGrid.appendChild(d); }
    compPage.addEventListener("mousemove", function(e) {
      if (compPage.style.display==="none") return;
      var r=compGrid.getBoundingClientRect();
      var col2=Math.floor((e.clientX-r.left)/(r.width/gs2));
      var row2=Math.floor((e.clientY-r.top)/(r.height/gs2));
      var idx2=row2*gs2+col2;
      var px2=compGrid.children[idx2];
      if(px2&&!px2.dataset.lit){px2.dataset.lit="1";px2.style.background=cols2[Math.floor(Math.random()*4)];px2.style.opacity="0.8";
        setTimeout(function(){px2.style.background="";px2.style.opacity="";delete px2.dataset.lit;},700);}
    });
  }

  function showCompletion() {
    if (compPage) { compPage.style.display = "flex"; }
  }

  if (compClose) {
    compClose.onclick = function() {
      if (compPage) { compPage.style.opacity = "0"; setTimeout(function(){ compPage.style.display="none"; },500); }
    };
  }

  // === START ===
  go(0);
});
