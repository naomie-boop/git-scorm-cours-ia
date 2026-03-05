document.addEventListener("DOMContentLoaded", function() {
  try { initSCORM(); } catch(e) {}

  // === COVER ===
  var cover = document.getElementById("coverPage");
  var coverBtn = document.getElementById("coverStartBtn");
  var coverGrid = document.getElementById("coverGrid");
  if (coverBtn) coverBtn.onclick = function() {
    if (cover) { cover.style.transition="opacity .5s"; cover.style.opacity="0"; cover.style.pointerEvents="none"; }
    setTimeout(function(){ if(cover) cover.style.display="none"; }, 500);
  };
  if (coverGrid) {
    var gs=20, cols=["#0071e3","#5ac8fa","#7B2FFF","#34c759"];
    coverGrid.style.gridTemplateColumns="repeat("+gs+",1fr)";
    coverGrid.style.gridTemplateRows="repeat("+gs+",1fr)";
    for(var i=0;i<gs*gs;i++){var d=document.createElement("div");d.className="pixel";coverGrid.appendChild(d);}
    document.addEventListener("mousemove",function(e){
      if(!cover||cover.style.display==="none") return;
      var r=coverGrid.getBoundingClientRect(),c=Math.floor((e.clientX-r.left)/(r.width/gs)),row=Math.floor((e.clientY-r.top)/(r.height/gs)),idx=row*gs+c;
      var px=coverGrid.children[idx];
      if(px&&!px.dataset.lit){px.dataset.lit="1";px.style.background=cols[Math.floor(Math.random()*4)];px.style.opacity=".7";
        setTimeout(function(){px.style.background="";px.style.opacity="";delete px.dataset.lit;},600);}
    });
  }

  // === STATE ===
  var allSteps = document.querySelectorAll(".step-container");
  var total = allSteps.length;
  var cur = 0, done = {}, score = 0, scoreTotal = 0, weak = [];
  var stepDone = {}; // tracks if step activity is completed

  // === NAVIGATION ===
  function go(idx) {
    if (idx<0||idx>=total) return;
    // Lock check: can't go forward if current step not done (except going back)
    if (idx > cur && !stepDone[cur] && cur > 0) return;
    cur = idx;
    allSteps.forEach(function(el,i){ el.style.display = i===idx ? "block" : "none"; });
    done[idx] = true;
    updateUI();
    window.scrollTo({top:0,behavior:"smooth"});
    // Animate in
    var visible = allSteps[idx];
    if (visible) visible.querySelectorAll(".animate-in").forEach(function(el,i){
      setTimeout(function(){el.style.opacity="1";el.style.transform="translateY(0)";},i*80);
    });
    // Counters
    if (visible) visible.querySelectorAll(".counter-num[data-target]").forEach(function(el){
      if(el.dataset.ran) return; el.dataset.ran="1";
      var t=parseFloat(el.dataset.target),s=el.dataset.suffix||"",p=el.dataset.prefix||"",st=null;
      requestAnimationFrame(function tick(ts){if(!st)st=ts;var pr=Math.min((ts-st)/1500,1);var v=Math.floor(pr*t);
        if(pr<1&&Math.random()>.85)v+=Math.floor(Math.random()*5);if(v>t)v=t;el.textContent=p+v+s;
        if(pr<1)requestAnimationFrame(tick);else el.textContent=p+Math.round(t)+s;});
    });
    // Typewriter
    if (visible) visible.querySelectorAll("[data-typewriter]").forEach(function(el){
      if(el.dataset.tw) return; el.dataset.tw="1";
      var txt=el.textContent;el.textContent="";var ci=0;
      (function tw(){if(ci<=txt.length){el.textContent=txt.slice(0,ci);ci++;setTimeout(tw,50);}})();
    });
    // Update score display on synthesis step
    updateScoreDisplay();
    try{setSCORMLocation(idx);}catch(e){}
    if(Object.keys(done).length>=total){try{setSCORMComplete();setSCORMScore(scoreTotal>0?(score/scoreTotal)*100:100);}catch(e){}}
  }

  function updateUI() {
    // Progress bar
    var pct = Math.round(Object.keys(done).length/total*100);
    document.querySelectorAll(".progress-bar-fill").forEach(function(b){b.style.width=pct+"%";});
    // Breadcrumb
    document.querySelectorAll(".breadcrumb-link").forEach(function(l,i){
      var isCur = i===cur, isDone = done[i] && i!==cur;
      l.style.fontWeight = isCur?"700":"500";
      l.style.color = isCur?"#fff" : isDone?"#34c759":"#86868b";
      l.style.background = isCur?"#0071e3" : "transparent";
      l.style.borderColor = isCur?"#0071e3" : "transparent";
    });
    // Next button
    var next = document.getElementById("nextBtn");
    var prev = document.getElementById("prevBtn");
    if (prev) prev.disabled = cur===0;
    if (next) {
      next.textContent = cur===total-1 ? "Terminer \u2713" : "Suivant \u2192";
      var locked = cur > 0 && cur < total-1 && !stepDone[cur];
      next.disabled = locked;
      next.style.opacity = locked ? "0.3" : "1";
    }
    // CTA buttons
    var cta = allSteps[cur] ? allSteps[cur].querySelector(".step-next-btn") : null;
    if (cta) {
      var locked2 = !stepDone[cur];
      cta.disabled = locked2;
      cta.style.opacity = locked2 ? "0.3" : "1";
    }
  }

  function unlockStep(idx) {
    if (typeof idx === "undefined") idx = cur;
    stepDone[idx] = true;
    updateUI();
  }

  function updateScoreDisplay() {
    // Circle
    var container = allSteps[cur];
    if (!container) return;
    var fgStroke = container.querySelector(".fg-stroke");
    var fgFill = container.querySelector(".fg-fill");
    var circleText = container.querySelector(".circle-text");
    if (fgStroke && circleText && scoreTotal > 0) {
      var pct = Math.round((score/scoreTotal)*100);
      var circ = 2*Math.PI*70;
      fgStroke.style.strokeDasharray = circ;
      fgStroke.style.strokeDashoffset = circ-(circ*pct/100);
      if(fgFill){var r=70*(pct/100);fgFill.setAttribute("r",r);fgFill.setAttribute("cy",140-r);}
      circleText.textContent = pct+"%";
      fgStroke.style.stroke = pct>=80?"#34c759":pct>=60?"#0071e3":"#ff3b30";
    }
    // Weak areas
    var weakList = container.querySelector(".weak-areas-list");
    if (weakList) {
      if (weak.length===0) weakList.innerHTML="<li style='color:#34c759'>Aucun point faible !</li>";
      else weakList.innerHTML = weak.map(function(w){return "<li>"+w+"</li>";}).join("");
    }
    // Badge message
    var badge = container.querySelector(".badge-message");
    if (badge && scoreTotal>0) {
      var p=Math.round((score/scoreTotal)*100);
      badge.textContent = p>=80?"Excellent ! Vous ma\u00eetrisez cet enjeu.":p>=60?"Bien jou\u00e9, quelques points \u00e0 revoir.":"Des notions \u00e0 approfondir.";
      badge.style.display="inline-block";badge.style.padding="6px 14px";badge.style.borderRadius="980px";
      badge.style.background=p>=80?"rgba(52,199,89,.06)":p>=60?"rgba(0,113,227,.06)":"rgba(255,59,48,.06)";
    }
  }

  // Step 0 always unlocked
  stepDone[0] = true;
  stepDone[1] = true; // Discovery is reading

  // Prev/Next
  document.getElementById("prevBtn").onclick = function(){ go(cur-1); };
  document.getElementById("nextBtn").onclick = function(){
    if (cur===total-1) {
      // Show celebration grid if exists
      var celebGrid = document.getElementById("celebGrid");
      if (celebGrid && !celebGrid.dataset.init) {
        celebGrid.dataset.init="1";
        var gs2=18,cols2=["#0071e3","#5ac8fa","#34c759","#5856d6","#ff9f0a"];
        celebGrid.style.gridTemplateColumns="repeat("+gs2+",1fr)";
        celebGrid.style.gridTemplateRows="repeat("+gs2+",1fr)";
        for(var j=0;j<gs2*gs2;j++){var d2=document.createElement("div");d2.className="pixel";celebGrid.appendChild(d2);}
        document.addEventListener("mousemove",function(e){
          var r=celebGrid.getBoundingClientRect(),c=Math.floor((e.clientX-r.left)/(r.width/gs2)),row=Math.floor((e.clientY-r.top)/(r.height/gs2)),idx=row*gs2+c;
          var px=celebGrid.children[idx];
          if(px&&!px.dataset.lit){px.dataset.lit="1";px.style.background=cols2[Math.floor(Math.random()*5)];px.style.opacity=".7";
            setTimeout(function(){px.style.background="";px.style.opacity="";delete px.dataset.lit;},600);}
        });
      }
      try{setSCORMComplete();setSCORMScore(scoreTotal>0?(score/scoreTotal)*100:100);}catch(e){}
    } else { go(cur+1); }
  };

  // Breadcrumbs (WITH lock check)
  document.querySelectorAll(".breadcrumb-link").forEach(function(l){
    l.onclick = function(){
      var target = parseInt(l.dataset.step);
      if (isNaN(target)) return;
      // Can go back freely, but forward only if all previous steps done
      if (target <= cur) { go(target); return; }
      // Check all steps before target are done
      for (var s=0; s<target; s++) {
        if (!stepDone[s] && s > 1) return; // blocked
      }
      go(target);
    };
  });

  // === ACCORDIONS ===
  document.querySelectorAll(".accordion-header").forEach(function(h){
    h.onclick = function(){
      var item=h.parentElement,was=item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item").forEach(function(a){a.classList.remove("open");});
      if(!was)item.classList.add("open");
      unlockStep();
    };
  });

  // === FLIP CARDS ===
  document.querySelectorAll(".flip-card").forEach(function(card){
    card.addEventListener("click",function(e){e.stopPropagation();card.classList.toggle("flipped");unlockStep();},true);
  });

  // === TABS ===
  document.querySelectorAll(".tab-btn").forEach(function(btn){
    btn.onclick = function(){
      var ct=btn.closest(".tabs-container"),tgt=btn.dataset.tab;
      ct.querySelectorAll(".tab-btn").forEach(function(b){b.classList.toggle("active",b===btn);});
      ct.querySelectorAll(".tab-panel").forEach(function(p){p.classList.toggle("active",p.dataset.tab===tgt);});
    };
  });

  // === DND ===
  document.querySelectorAll(".dnd-container").forEach(function(ct){
    var dragEl=null;
    ct.querySelectorAll(".dnd-sources .dnd-item").forEach(function(item){
      item.ondragstart=function(e){if(item.dataset.placed)return e.preventDefault();dragEl=item;item.style.opacity="0.3";e.dataTransfer.setData("text","x");};
      item.ondragend=function(){item.style.opacity=item.dataset.placed?"0.2":"";};
      // Click fallback for mobile
      item.onclick=function(){if(item.dataset.placed)return;if(dragEl===item){dragEl=null;item.style.outline="";return;}
        if(dragEl)dragEl.style.outline="";dragEl=item;item.style.outline="2px solid #0071e3";};
    });
    ct.querySelectorAll(".dnd-zone").forEach(function(zone){
      zone.ondragover=function(e){e.preventDefault();zone.style.borderColor="#0071e3";};
      zone.ondragleave=function(){zone.style.borderColor="";};
      zone.ondrop=function(e){e.preventDefault();zone.style.borderColor="";if(dragEl){var cl=dragEl.cloneNode(true);zone.appendChild(cl);dragEl.dataset.placed="1";dragEl.style.opacity="0.2";dragEl.style.pointerEvents="none";dragEl=null;}};
      // Click fallback: click zone to place selected item
      zone.onclick=function(){if(!dragEl)return;var cl=dragEl.cloneNode(true);zone.appendChild(cl);dragEl.dataset.placed="1";dragEl.style.opacity="0.2";dragEl.style.pointerEvents="none";dragEl.style.outline="";dragEl=null;};
    });
    var checkBtn=ct.querySelector(".dnd-check-btn");
    if(checkBtn) checkBtn.onclick=function(){
      var ok=0,tot=0;
      ct.querySelectorAll(".dnd-zone").forEach(function(z){z.querySelectorAll(".dnd-item").forEach(function(it){
        tot++;if(it.dataset.zone===z.dataset.zone){ok++;it.style.borderColor="#34c759";it.style.background="rgba(52,199,89,.04)";}
        else{it.style.borderColor="#ff3b30";it.style.background="rgba(255,59,48,.04)";weak.push("Classement");}
      });});
      scoreTotal+=tot;score+=ok;
      var fb=ct.querySelector(".dnd-feedback");
      if(fb){fb.style.display="block";fb.textContent=ok===tot?"\u2705 Parfait !":"\u274C "+ok+"/"+tot+" correct(s).";
        fb.style.background=ok===tot?"rgba(52,199,89,.06)":"rgba(255,59,48,.06)";}
      checkBtn.disabled=true;checkBtn.style.opacity="0.3";
      unlockStep();
    };
  });

  // === MATCHING ===
  document.querySelectorAll(".matching-container").forEach(function(ct){
    var sel=null;
    ct.querySelectorAll(".match-left .match-item").forEach(function(l){
      l.onclick=function(){if(l.classList.contains("matched"))return;
        ct.querySelectorAll(".match-left .match-item").forEach(function(x){x.style.outline="";});
        l.style.outline="2px solid #0071e3";sel=l;};
    });
    ct.querySelectorAll(".match-right .match-item").forEach(function(r){
      r.onclick=function(){if(!sel||r.classList.contains("matched"))return;
        scoreTotal++;
        if(sel.dataset.match===r.dataset.match){
          score++;sel.classList.add("matched");r.classList.add("matched");
          sel.style.outline="";sel.style.borderColor="#34c759";sel.style.background="rgba(52,199,89,.04)";
          r.style.borderColor="#34c759";r.style.background="rgba(52,199,89,.04)";
          // Check all done
          if(ct.querySelectorAll(".match-left .match-item:not(.matched)").length===0){
            var fb=ct.querySelector(".dnd-feedback");
            if(fb){fb.style.display="block";fb.textContent="\u2705 Toutes les associations sont correctes !";fb.style.background="rgba(52,199,89,.06)";}
            unlockStep();
          }
        } else {
          sel.style.borderColor="#ff3b30";r.style.borderColor="#ff3b30";
          weak.push("Association");
          setTimeout(function(){sel.style.borderColor="";r.style.borderColor="";sel.style.outline="";},500);
        }
        sel=null;};
    });
  });

  // === SCENARIO ===
  document.querySelectorAll(".scenario-container").forEach(function(ct){
    var nodes=ct.querySelectorAll(".scenario-node");
    ct.querySelectorAll(".scenario-choice").forEach(function(ch){
      ch.onclick=function(){
        var node=ch.closest(".scenario-node");if(node.dataset.done)return;node.dataset.done="1";
        var pts=parseInt(ch.dataset.points)||0;scoreTotal+=2;score+=pts;
        var color=pts>=2?"#34c759":pts>=1?"#ff9f0a":"#ff3b30";
        var bg=pts>=2?"rgba(52,199,89,.04)":pts>=1?"rgba(255,159,10,.04)":"rgba(255,59,48,.04)";
        ch.style.borderColor=color;ch.style.background=bg;
        if(pts<2) weak.push("Sc\u00e9nario");
        var res=node.querySelector(".scenario-result");
        if(res){res.style.display="block";res.textContent=ch.dataset.feedback;res.style.background=bg;res.style.borderLeft="2px solid "+color;res.style.padding="10px 14px";res.style.borderRadius="8px";res.style.marginTop="10px";res.style.fontSize=".85rem";}
        var nx=parseInt(ch.dataset.next);
        if(!isNaN(nx)&&nodes[nx])setTimeout(function(){nodes[nx].style.display="block";},600);
        unlockStep();
      };
    });
  });

  // === QUIZ ===
  var quizAnswered = 0, quizTotal = document.querySelectorAll(".quiz-question").length;
  document.querySelectorAll(".quiz-question").forEach(function(q){
    var selOpt=null;
    q.querySelectorAll(".quiz-option").forEach(function(o){
      o.onclick=function(){if(q.dataset.done)return;
        q.querySelectorAll(".quiz-option").forEach(function(x){x.style.borderColor="";x.style.background="";
          x.querySelector(".option-letter").style.background="";x.querySelector(".option-letter").style.color="";});
        o.style.borderColor="#0071e3";o.style.background="rgba(0,113,227,.04)";
        o.querySelector(".option-letter").style.background="#0071e3";o.querySelector(".option-letter").style.color="#fff";
        selOpt=o;
        var btn=q.querySelector(".quiz-validate-btn");if(btn){btn.disabled=false;btn.style.opacity="1";}
      };
    });
    var vbtn=q.querySelector(".quiz-validate-btn");
    if(vbtn) vbtn.onclick=function(){
      if(!selOpt||q.dataset.done)return;q.dataset.done="1";scoreTotal++;quizAnswered++;
      var ok=selOpt.dataset.correct==="true";
      if(ok){score++;selOpt.style.borderColor="#34c759";selOpt.style.background="rgba(52,199,89,.04)";
        selOpt.querySelector(".option-letter").style.background="#34c759";}
      else{selOpt.style.borderColor="#ff3b30";selOpt.style.background="rgba(255,59,48,.04)";
        selOpt.querySelector(".option-letter").style.background="#ff3b30";
        q.querySelectorAll(".quiz-option[data-correct='true']").forEach(function(c){c.style.borderColor="#34c759";c.style.background="rgba(52,199,89,.04)";c.querySelector(".option-letter").style.background="#34c759";c.querySelector(".option-letter").style.color="#fff";});
        var theme=q.querySelector("h4")?q.querySelector("h4").textContent.substring(0,30):"Quiz";
        weak.push(theme);
      }
      var fb=q.querySelector(".quiz-feedback");
      if(fb){fb.style.display="block";fb.textContent=ok?("\u2705 "+fb.dataset.correctText):("\u274C "+fb.dataset.incorrectText);
        fb.style.background=ok?"rgba(52,199,89,.06)":"rgba(255,59,48,.06)";fb.style.color=ok?"#1a7a3a":"#c41e16";}
      vbtn.disabled=true;vbtn.style.opacity="0.3";
      // Update score bar
      var scoreBar=document.querySelector(".step-container[style*='block'] .score-fill");
      var scoreVal=document.querySelector(".step-container[style*='block'] .score-value");
      if(scoreBar&&scoreTotal>0){var p=Math.round((score/scoreTotal)*100);scoreBar.style.width=p+"%";if(scoreVal)scoreVal.textContent=p+"%";}
      if(quizAnswered>=quizTotal) unlockStep();
    };
  });

  // === VRAI/FAUX ===
  document.querySelectorAll(".vf-btn").forEach(function(btn){
    btn.onclick=function(){
      var item=btn.closest(".vf-item");if(item.classList.contains("answered"))return;item.classList.add("answered");
      var isV=btn.dataset.answer==="vrai",correct=item.dataset.correct==="vrai",ok=isV===correct;
      scoreTotal++;if(ok)score++;else weak.push("Vrai/Faux");
      btn.style.background=ok?"#34c759":"#ff3b30";btn.style.color="#fff";btn.style.borderColor=ok?"#34c759":"#ff3b30";
      item.style.borderColor=ok?"#34c759":"#ff3b30";
      var fb=item.querySelector(".vf-feedback");if(fb)fb.style.display="block";
      unlockStep();
    };
  });

  // === REVEAL ===
  document.querySelectorAll(".reveal-card").forEach(function(c){
    c.onclick=function(){if(c.classList.contains("revealed"))return;c.classList.add("revealed");c.textContent=c.dataset.content;};
  });

  // === BLANKS ===
  document.querySelectorAll(".blanks-container").forEach(function(ct){
    var activeSlot=null;
    ct.querySelectorAll(".blank-slot").forEach(function(s){
      s.onclick=function(){activeSlot=s;ct.querySelectorAll(".blank-slot").forEach(function(x){x.style.outline="";});s.style.outline="2px solid #0071e3";};
    });
    ct.querySelectorAll(".blank-option").forEach(function(o){
      o.onclick=function(){if(!activeSlot||o.classList.contains("used"))return;
        activeSlot.textContent=o.textContent;activeSlot.classList.add("filled");o.classList.add("used");
        scoreTotal++;
        if(activeSlot.dataset.answer===o.dataset.value){score++;activeSlot.style.color="#34c759";activeSlot.style.borderColor="#34c759";}
        else{activeSlot.style.color="#ff3b30";activeSlot.style.borderColor="#ff3b30";weak.push("Texte \u00e0 trous");}
        activeSlot.style.outline="";activeSlot=null;
        unlockStep();
      };
    });
  });

  // === DEBATE ===
  document.querySelectorAll(".debate-side").forEach(function(s){
    s.onclick=function(){var ct=s.closest(".debate-container");if(ct.dataset.done)return;ct.dataset.done="1";
      s.style.borderColor="#0071e3";s.style.background="rgba(0,113,227,.04)";
      var rv=ct.querySelector(".debate-reveal");if(rv)rv.style.display="block";
      unlockStep();
    };
  });

  // === CHECKLIST ===
  document.querySelectorAll(".checklist-item").forEach(function(it){
    it.onclick=function(){it.classList.toggle("checked");
      var ct=it.closest(".checklist-container"),n=ct.querySelectorAll(".checklist-item.checked").length,t=ct.querySelectorAll(".checklist-item").length;
      var pr=ct.querySelector(".checklist-progress");if(pr)pr.textContent=n+"/"+t+" engagements pris";
      if(n>0) unlockStep();
    };
  });

  // === SLIDER ===
  document.querySelectorAll(".slider-container input[type=range]").forEach(function(s){
    var d=s.parentElement.querySelector(".slider-value");
    var msgs=["D\u00e9butant","Notions de base","Interm\u00e9diaire","Avanc\u00e9","Expert"];
    s.oninput=function(){if(d)d.textContent=s.value+"/5 - "+msgs[parseInt(s.value)-1];};
  });

  // === SCROLL HINT ===
  var scrollHint=document.getElementById("scrollHint");
  if(scrollHint) window.addEventListener("scroll",function(){scrollHint.style.opacity=window.scrollY>80?"0":"0.5";});

  // === NEXT STEP CTA ===
  var navLabels=[];
  document.querySelectorAll(".breadcrumb-link").forEach(function(l){navLabels.push(l.textContent.replace(/[0-9]/g,"").trim());});
  allSteps.forEach(function(step,idx){
    if(idx>=total-1) return;
    var nextLabel=navLabels[idx+1]||"suivante";
    var teasers=["Pr\u00eat \u00e0 explorer cet enjeu en profondeur ?","Passons aux risques concrets.","D\u00e9couvrez comment y r\u00e9pondre.","Vivez une situation r\u00e9aliste.","Testez vos connaissances.","Voyons votre score.","Terminez en beaut\u00e9."];
    var previews=["M\u00e9canismes IA, usages concrets et principes cl\u00e9s.","Les risques identifi\u00e9s avec des exemples r\u00e9els.","Des mesures concr\u00e8tes avec des activit\u00e9s interactives.","Un sc\u00e9nario professionnel o\u00f9 vos choix comptent.","Un quiz pour valider vos acquis.","Votre synth\u00e8se personnalis\u00e9e et vos engagements.","Votre badge de compl\u00e9tion."];
    var cta=document.createElement("div");cta.className="step-next-cta";
    cta.innerHTML="<div class='next-teaser'>\u2705 Section termin\u00e9e</div><div class='next-title'>"+(teasers[idx]||"La suite vous attend.")+"</div><div class='next-preview'>"+(previews[idx]||"")+"</div><button class='step-next-btn' data-goto='"+(idx+1)+"'>Continuer vers "+nextLabel+" <span class='arrow'>\u2192</span></button>";
    step.appendChild(cta);
  });
  document.querySelectorAll(".step-next-btn").forEach(function(btn){
    btn.onclick=function(){var t=parseInt(btn.dataset.goto);if(!isNaN(t))go(t);};
  });

  // === START ===
  go(0);
});
