document.addEventListener("DOMContentLoaded", function() {
  try { initSCORM(); } catch(e) {}

  // === COVER ===
  var cover = document.getElementById("coverPage");
  var coverBtn = document.getElementById("coverStartBtn");
  var coverGrid = document.getElementById("coverGrid");
  var coverMoveHandler = null;

  if (coverBtn) coverBtn.onclick = function() {
    if (cover) { cover.style.transition="opacity .5s"; cover.style.opacity="0"; cover.style.pointerEvents="none"; }
    setTimeout(function(){ if(cover) cover.style.display="none"; if(coverMoveHandler) document.removeEventListener("mousemove",coverMoveHandler); }, 500);
  };
  if (coverGrid) {
    var gs=20, ccols=["#0071e3","#5ac8fa","#7B2FFF","#34c759"];
    coverGrid.style.gridTemplateColumns="repeat("+gs+",1fr)";
    coverGrid.style.gridTemplateRows="repeat("+gs+",1fr)";
    for(var i=0;i<gs*gs;i++){var d=document.createElement("div");d.className="pixel";coverGrid.appendChild(d);}
    coverMoveHandler = function(e){
      if(!cover||cover.style.display==="none") return;
      var r=coverGrid.getBoundingClientRect(),col=Math.floor((e.clientX-r.left)/(r.width/gs)),row=Math.floor((e.clientY-r.top)/(r.height/gs)),idx=row*gs+col;
      var px=coverGrid.children[idx];
      if(px&&!px.dataset.lit){px.dataset.lit="1";px.style.background=ccols[Math.floor(Math.random()*4)];px.style.opacity=".7";
        setTimeout(function(){px.style.background="";px.style.opacity="";delete px.dataset.lit;},600);}
    };
    document.addEventListener("mousemove", coverMoveHandler);
  }

  // === STATE ===
  var allSteps = document.querySelectorAll(".step-container");
  var totalSteps = allSteps.length;
  var cur = 0;
  var visited = {};        // steps visited
  var stepCompleted = {};  // steps where activity is done (real completion)
  var score = 0, scoreTotal = 0;
  var quizScore = 0, quizTotal = 0;
  var weakSet = new Set();

  // === NAVIGATION ===
  function go(idx) {
    if (idx < 0 || idx >= totalSteps) return;
    // Forward lock: must complete current step to go forward (except step 0 on first load)
    if (idx > cur && cur > 0 && !stepCompleted[cur]) return;
    cur = idx;
    allSteps.forEach(function(el,i){ el.style.display = i===idx ? "block" : "none"; });
    visited[idx] = true;
    updateUI();
    window.scrollTo({top:0,behavior:"smooth"});
    // Animate in
    allSteps[idx].querySelectorAll(".animate-in").forEach(function(el,i){
      setTimeout(function(){el.style.opacity="1";el.style.transform="translateY(0)";},i*80);
    });
    runCounters(); runTypewriter(); updateScoreDisplay(); startQuizTimers();
    try{setSCORMLocation(idx);}catch(e){}
    checkSCORMComplete();
  }

  function updateUI() {
    var pct = Math.round(Object.keys(visited).length/totalSteps*100);
    document.querySelectorAll(".progress-bar-fill").forEach(function(b){b.style.height=pct+"%";});
    // Progress text
    document.querySelectorAll(".progress-text").forEach(function(t){t.textContent=pct+"% termin\u00e9";});
    // Breadcrumb
    document.querySelectorAll(".breadcrumb-link").forEach(function(l,i){
      var isCur=i===cur, isDone=stepCompleted[i];
      l.style.fontWeight=isCur?"700":"500";
      l.style.color=isCur?"#fff":isDone?"#34c759":"#86868b";
      l.style.background=isCur?"#0071e3":"transparent";
      l.style.borderColor=isCur?"#0071e3":"transparent";
      var num=l.querySelector(".step-num");
      if(num){num.style.background=isCur?"rgba(255,255,255,.25)":isDone?"#34c759":"";num.style.color=isCur||isDone?"#fff":"";}
    });
    // Prev/Next
    var prev=document.getElementById("prevBtn"), next=document.getElementById("nextBtn");
    if(prev) prev.disabled=cur===0;
    if(next){
      next.textContent=cur===totalSteps-1?"Terminer \u2713":"Suivant \u2192";
      var locked=cur>0 && cur<totalSteps-1 && !stepCompleted[cur];
      next.disabled=locked; next.style.opacity=locked?"0.3":"1";
    }
    // CTA button
    var cta=allSteps[cur]?allSteps[cur].querySelector(".step-next-btn"):null;
    if(cta){var l2=!stepCompleted[cur]&&cur>0;cta.disabled=l2;cta.style.opacity=l2?"0.3":"1";}
  }

  function markStepDone(idx) {
    if(typeof idx==="undefined") idx=cur;
    stepCompleted[idx]=true;
    updateUI();
  }

  function checkSCORMComplete() {
    // Only complete if ALL steps are done (visited AND completed)
    var allDone = true;
    for(var s=0;s<totalSteps;s++){
      if(!stepCompleted[s] && s>0 && s<totalSteps-1) allDone=false;
    }
    if(allDone && Object.keys(visited).length>=totalSteps){
      var finalScore = scoreTotal>0?Math.round((score/scoreTotal)*100):0;
      try{setSCORMScore(finalScore);setSCORMComplete();}catch(e){}
    }
  }

  function updateScoreDisplay() {
    var container=allSteps[cur]; if(!container) return;
    // Circle
    var fgStroke=container.querySelector(".fg-stroke"),ct=container.querySelector(".circle-text");
    if(fgStroke&&ct&&scoreTotal>0){
      var pct=Math.round((score/scoreTotal)*100),circ=2*Math.PI*78;
      fgStroke.style.strokeDasharray=circ;fgStroke.style.strokeDashoffset=circ-(circ*pct/100);
      ct.textContent=pct+"%";fgStroke.style.stroke=pct>=80?"#34c759":pct>=60?"#0071e3":"#ff3b30";
    }
    // Weak areas
    var wl=container.querySelector(".weak-areas-list");
    if(wl){var arr=Array.from(weakSet);wl.innerHTML=arr.length===0?"<li style='color:#34c759'>Aucun point faible !</li>":arr.map(function(w){return"<li>"+w+"</li>";}).join("");}
    // Badge
    var badge=container.querySelector(".badge-message");
    if(badge&&scoreTotal>0){var p=Math.round((score/scoreTotal)*100);badge.textContent=p>=80?"Excellent !":p>=60?"Bien jou\u00e9 !":"Des notions \u00e0 revoir.";badge.style.display="inline-block";badge.style.padding="6px 14px";badge.style.borderRadius="980px";badge.style.background=p>=80?"rgba(52,199,89,.06)":p>=60?"rgba(0,113,227,.06)":"rgba(255,59,48,.06)";}
  }

  function runCounters(){
    allSteps[cur].querySelectorAll(".counter-num[data-target]").forEach(function(el){
      if(el.dataset.ran) return; el.dataset.ran="1";
      var t=parseFloat(el.dataset.target),s=el.dataset.suffix||"",p=el.dataset.prefix||"",st=null;
      requestAnimationFrame(function tick(ts){if(!st)st=ts;var pr=Math.min((ts-st)/1500,1);
        var v=Math.floor(pr*t);if(v>t)v=t;el.textContent=p+v+s;
        if(pr<1)requestAnimationFrame(tick);else el.textContent=p+Math.round(t)+s;});
    });
  }

  function runTypewriter(){
    allSteps[cur].querySelectorAll("[data-typewriter]").forEach(function(el){
      if(el.dataset.tw) return; el.dataset.tw="1";
      var txt=el.textContent;el.textContent="";var ci=0;
      (function tw(){if(ci<=txt.length){el.textContent=txt.slice(0,ci);ci++;setTimeout(tw,50);}})();
    });
  }

  // === QUIZ TIMER ===
  var activeTimers = [];
  function startQuizTimers(){
    activeTimers.forEach(function(t){clearInterval(t);});
    activeTimers=[];
    allSteps[cur].querySelectorAll(".quiz-question").forEach(function(q){
      if(q.dataset.done) return;
      var fill=q.querySelector(".quiz-timer-fill"); if(!fill) return;
      fill.style.width="100%"; fill.style.transition="none";
      var timeLeft=30;
      var timer=setInterval(function(){
        if(q.dataset.done){clearInterval(timer);return;}
        timeLeft--;
        fill.style.transition="width 1s linear";
        fill.style.width=(timeLeft/30*100)+"%";
        if(timeLeft<=0){
          clearInterval(timer);
          if(!q.dataset.done){
            q.dataset.done="1"; scoreTotal++; quizTotal++;
            weakSet.add("Temps \u00e9coul\u00e9");
            var fb=q.querySelector(".quiz-feedback");
            if(fb){fb.style.display="block";fb.textContent="\u23F0 Temps \u00e9coul\u00e9 ! "+fb.dataset.incorrectText;fb.style.background="rgba(255,59,48,.06)";fb.style.color="#c41e16";}
            q.querySelectorAll(".quiz-option[data-correct='true']").forEach(function(c){c.style.borderColor="#34c759";c.style.background="rgba(52,199,89,.04)";var ol=c.querySelector(".option-letter");if(ol){ol.style.background="#34c759";ol.style.color="#fff";}});
            var vb=q.querySelector(".quiz-validate-btn");if(vb){vb.disabled=true;vb.style.opacity="0.3";}
            checkQuizComplete();
          }
        }
      },1000);
      activeTimers.push(timer);
    });
  }

  function checkQuizComplete(){
    var all=allSteps[cur].querySelectorAll(".quiz-question").length;
    var done=allSteps[cur].querySelectorAll(".quiz-question[data-done]").length;
    if(done>=all){
      markStepDone();
      // Update quiz score bar
      var bar=allSteps[cur].querySelector(".score-fill");
      var val=allSteps[cur].querySelector(".score-value");
      if(bar&&quizTotal>0){var p=Math.round((quizScore/quizTotal)*100);bar.style.width=p+"%";if(val)val.textContent=p+"%";}
      // Show retry if <60%
      if(quizTotal>0&&(quizScore/quizTotal)<0.6){
        var rm=allSteps[cur].querySelector(".quiz-retry-msg");if(rm)rm.style.display="block";
      }
    }
  }

  // Step 0: unlock only after ALL vrai/faux answered
  function checkVFComplete(){
    var container=allSteps[cur];if(!container) return;
    var total=container.querySelectorAll(".vf-item").length;
    var done=container.querySelectorAll(".vf-item.answered").length;
    if(total>0&&done>=total) markStepDone();
  }

  // === PREV/NEXT ===
  document.getElementById("prevBtn").onclick=function(){go(cur-1);};
  document.getElementById("nextBtn").onclick=function(){
    if(cur===totalSteps-1){
      // Init celebration grid
      var cg=document.getElementById("celebGrid");
      if(cg&&!cg.dataset.init){
        cg.dataset.init="1";
        var gs2=18,cols2=["#0071e3","#5ac8fa","#34c759","#5856d6","#ff9f0a"];
        cg.style.gridTemplateColumns="repeat("+gs2+",1fr)";cg.style.gridTemplateRows="repeat("+gs2+",1fr)";
        for(var j=0;j<gs2*gs2;j++){var d2=document.createElement("div");d2.className="pixel";cg.appendChild(d2);}
        cg.parentElement.addEventListener("mousemove",function(e){
          var r=cg.getBoundingClientRect(),c=Math.floor((e.clientX-r.left)/(r.width/gs2)),row=Math.floor((e.clientY-r.top)/(r.height/gs2)),idx=row*gs2+c;
          var px=cg.children[idx];
          if(px&&!px.dataset.lit){px.dataset.lit="1";px.style.background=cols2[Math.floor(Math.random()*5)];px.style.opacity=".7";
            setTimeout(function(){px.style.background="";px.style.opacity="";delete px.dataset.lit;},600);}
        });
      }
      markStepDone();
      try{var fs=scoreTotal>0?Math.round((score/scoreTotal)*100):0;setSCORMScore(fs);setSCORMComplete();}catch(e){}
    } else { go(cur+1); }
  };

  // Breadcrumbs (with FULL lock check)
  document.querySelectorAll(".breadcrumb-link").forEach(function(l){
    l.onclick=function(){
      var target=parseInt(l.dataset.step);if(isNaN(target))return;
      if(target<=cur){go(target);return;}
      // Must have ALL intermediate steps completed
      for(var s=0;s<target;s++){if(!stepCompleted[s]&&s>0)return;}
      go(target);
    };
  });

  // === ACCORDIONS (unlock after opening 2+) ===
  document.querySelectorAll(".accordion").forEach(function(acc){
    var opened=new Set();
    acc.querySelectorAll(".accordion-header").forEach(function(h,i){
      h.onclick=function(){
        var item=h.parentElement,was=item.classList.contains("open");
        acc.querySelectorAll(".accordion-item").forEach(function(a){a.classList.remove("open");});
        if(!was){item.classList.add("open");opened.add(i);}
        var total=acc.querySelectorAll(".accordion-item").length;
        if(opened.size>=Math.min(2,total)) markStepDone();
      };
    });
  });

  // === FLIP CARDS (unlock after flipping 2+) ===
  document.querySelectorAll(".flip-cards-grid").forEach(function(grid){
    var flipped=new Set();
    grid.querySelectorAll(".flip-card").forEach(function(card,i){
      card.addEventListener("click",function(e){e.stopPropagation();card.classList.toggle("flipped");
        var front=card.querySelector(".flip-card-front");
        var back=card.querySelector(".flip-card-back");
        if(card.classList.contains("flipped")){front.style.display="none";back.style.display="block";flipped.add(i);}
        else{front.style.display="flex";back.style.display="none";}
        var total=grid.querySelectorAll(".flip-card").length;
        if(flipped.size>=Math.min(2,total)) markStepDone();
      },true);
    });
  });

  // === TABS ===
  document.querySelectorAll(".tab-btn").forEach(function(btn){
    btn.onclick=function(){
      var ct=btn.closest(".tabs-container"),tgt=btn.dataset.tab;
      ct.querySelectorAll(".tab-btn").forEach(function(b){b.classList.toggle("active",b===btn);});
      ct.querySelectorAll(".tab-panel").forEach(function(p){p.classList.toggle("active",p.dataset.tab===tgt);});
    };
  });

  // === DND (with reset button, no draggable on clones) ===
  document.querySelectorAll(".dnd-container").forEach(function(ct){
    var dragEl=null;
    var sources=ct.querySelectorAll(".dnd-sources .dnd-item");
    sources.forEach(function(item){
      item.ondragstart=function(e){if(item.dataset.placed){e.preventDefault();return;}dragEl=item;item.style.opacity="0.3";e.dataTransfer.setData("text","x");};
      item.ondragend=function(){item.style.opacity=item.dataset.placed?"0.2":"";};
      item.onclick=function(){if(item.dataset.placed)return;if(dragEl)dragEl.style.outline="";
        if(dragEl===item){dragEl=null;item.style.outline="";return;}
        dragEl=item;item.style.outline="2px solid #0071e3";};
    });
    ct.querySelectorAll(".dnd-zone").forEach(function(zone){
      zone.ondragover=function(e){e.preventDefault();zone.style.borderColor="#0071e3";};
      zone.ondragleave=function(){zone.style.borderColor="";};
      function dropInZone(zone2){
        if(!dragEl)return;
        var cl=dragEl.cloneNode(true);cl.removeAttribute("draggable");cl.style.cursor="default";
        zone2.appendChild(cl);dragEl.dataset.placed="1";dragEl.style.opacity="0.2";dragEl.style.pointerEvents="none";dragEl.style.outline="";dragEl=null;
      }
      zone.ondrop=function(e){e.preventDefault();zone.style.borderColor="";dropInZone(zone);};
      zone.onclick=function(){dropInZone(zone);};
    });
    // Reset button
    var resetBtn=document.createElement("button");resetBtn.className="quiz-validate-btn";resetBtn.style.background="#86868b";resetBtn.style.marginLeft="8px";
    resetBtn.textContent="R\u00e9initialiser";resetBtn.style.fontSize=".78rem";resetBtn.style.padding="6px 14px";
    var checkBtn=ct.querySelector(".dnd-check-btn");
    if(checkBtn){
      checkBtn.parentElement.insertBefore(resetBtn,checkBtn.nextSibling);
      resetBtn.onclick=function(){
        ct.querySelectorAll(".dnd-zone .dnd-item").forEach(function(cl){cl.remove();});
        sources.forEach(function(s){delete s.dataset.placed;s.style.opacity="";s.style.pointerEvents="";s.style.outline="";});
        var fb=ct.querySelector(".dnd-feedback");if(fb)fb.style.display="none";
        checkBtn.disabled=false;checkBtn.style.opacity="1";
      };
      checkBtn.onclick=function(){
        var ok=0,tot=0;
        ct.querySelectorAll(".dnd-zone").forEach(function(z){z.querySelectorAll(".dnd-item").forEach(function(it){
          tot++;if(it.dataset.zone===z.dataset.zone){ok++;it.style.borderColor="#34c759";it.style.background="rgba(52,199,89,.04)";}
          else{it.style.borderColor="#ff3b30";it.style.background="rgba(255,59,48,.04)";weakSet.add("Classement");}
        });});
        scoreTotal+=tot;score+=ok;
        var fb=ct.querySelector(".dnd-feedback");
        if(fb){fb.style.display="block";fb.textContent=ok===tot?"\u2705 Parfait !":"\u274C "+ok+"/"+tot+" correct(s).";fb.style.background=ok===tot?"rgba(52,199,89,.06)":"rgba(255,59,48,.06)";}
        checkBtn.disabled=true;checkBtn.style.opacity="0.3";resetBtn.style.display="none";
        markStepDone();
      };
    }
  });

  // === MATCHING (score only on first attempt per pair) ===
  document.querySelectorAll(".matching-container").forEach(function(ct){
    var sel=null, attempted=new Set();
    ct.querySelectorAll(".match-left .match-item").forEach(function(l){
      l.onclick=function(){if(l.classList.contains("matched"))return;
        ct.querySelectorAll(".match-left .match-item").forEach(function(x){x.style.outline="";});
        l.style.outline="2px solid #0071e3";sel=l;};
    });
    ct.querySelectorAll(".match-right .match-item").forEach(function(r){
      r.onclick=function(){if(!sel||r.classList.contains("matched"))return;
        var pairKey=sel.dataset.match+"-"+r.dataset.match;
        var isFirstAttempt=!attempted.has(sel.dataset.match);
        if(isFirstAttempt){scoreTotal++;attempted.add(sel.dataset.match);}
        if(sel.dataset.match===r.dataset.match){
          if(isFirstAttempt)score++;
          sel.classList.add("matched");r.classList.add("matched");
          sel.style.outline="";sel.style.borderColor="#34c759";sel.style.background="rgba(52,199,89,.04)";
          r.style.borderColor="#34c759";r.style.background="rgba(52,199,89,.04)";
          if(ct.querySelectorAll(".match-left .match-item:not(.matched)").length===0){
            var fb=ct.querySelector(".dnd-feedback");
            if(fb){fb.style.display="block";fb.textContent="\u2705 Toutes les associations sont correctes !";fb.style.background="rgba(52,199,89,.06)";}
            markStepDone();
          }
        } else {
          weakSet.add("Association");
          sel.style.borderColor="#ff3b30";r.style.borderColor="#ff3b30";
          var oldSel=sel;
          setTimeout(function(){oldSel.style.borderColor="";r.style.borderColor="";oldSel.style.outline="";},500);
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
        if(pts<2) weakSet.add("Sc\u00e9nario");
        var res=node.querySelector(".scenario-result");
        if(res){res.style.display="block";res.textContent=ch.dataset.feedback;res.style.background=bg;res.style.padding="10px 14px";res.style.borderRadius="8px";res.style.marginTop="10px";res.style.fontSize=".85rem";res.style.borderLeft="2px solid "+color;}
        var nx=parseInt(ch.dataset.next);
        if(!isNaN(nx)&&nodes[nx])setTimeout(function(){nodes[nx].style.display="block";},600);
        markStepDone();
      };
    });
  });

  // === QUIZ ===
  document.querySelectorAll(".quiz-question").forEach(function(q){
    var selOpt=null;
    q.querySelectorAll(".quiz-option").forEach(function(o){
      o.onclick=function(){if(q.dataset.done)return;
        q.querySelectorAll(".quiz-option").forEach(function(x){x.style.borderColor="";x.style.background="";var ol=x.querySelector(".option-letter");if(ol){ol.style.background="";ol.style.color="";}});
        o.style.borderColor="#0071e3";o.style.background="rgba(0,113,227,.04)";
        var ol=o.querySelector(".option-letter");if(ol){ol.style.background="#0071e3";ol.style.color="#fff";}
        selOpt=o;var btn=q.querySelector(".quiz-validate-btn");if(btn){btn.disabled=false;btn.style.opacity="1";}
      };
    });
    var vbtn=q.querySelector(".quiz-validate-btn");
    if(vbtn) vbtn.onclick=function(){
      if(!selOpt||q.dataset.done)return;q.dataset.done="1";scoreTotal++;quizTotal++;
      var ok=selOpt.dataset.correct==="true";
      if(ok){score++;quizScore++;selOpt.style.borderColor="#34c759";selOpt.style.background="rgba(52,199,89,.04)";var ol=selOpt.querySelector(".option-letter");if(ol){ol.style.background="#34c759";ol.style.color="#fff";}}
      else{selOpt.style.borderColor="#ff3b30";selOpt.style.background="rgba(255,59,48,.04)";var ol2=selOpt.querySelector(".option-letter");if(ol2){ol2.style.background="#ff3b30";ol2.style.color="#fff";}
        q.querySelectorAll(".quiz-option[data-correct='true']").forEach(function(c){c.style.borderColor="#34c759";c.style.background="rgba(52,199,89,.04)";var ol3=c.querySelector(".option-letter");if(ol3){ol3.style.background="#34c759";ol3.style.color="#fff";}});
        var theme=q.querySelector("h4")?q.querySelector("h4").textContent.substring(0,30):"Quiz";weakSet.add(theme);}
      var fb=q.querySelector(".quiz-feedback");
      if(fb){fb.style.display="block";fb.textContent=ok?("\u2705 "+fb.dataset.correctText):("\u274C "+fb.dataset.incorrectText);fb.style.background=ok?"rgba(52,199,89,.06)":"rgba(255,59,48,.06)";fb.style.color=ok?"#1a7a3a":"#c41e16";}
      vbtn.disabled=true;vbtn.style.opacity="0.3";
      checkQuizComplete();
    };
  });
  // Quiz retry
  document.querySelectorAll(".quiz-retry-btn").forEach(function(btn){btn.onclick=function(){go(2);};});

  // === VRAI/FAUX (unlock after ALL answered) ===
  document.querySelectorAll(".vf-btn").forEach(function(btn){
    btn.onclick=function(){
      var item=btn.closest(".vf-item");if(item.classList.contains("answered"))return;item.classList.add("answered");
      var isV=btn.dataset.answer==="vrai",correct=item.dataset.correct==="vrai",ok=isV===correct;
      scoreTotal++;if(ok)score++;else weakSet.add("Vrai/Faux");
      btn.style.background=ok?"#34c759":"#ff3b30";btn.style.color="#fff";btn.style.borderColor=ok?"#34c759":"#ff3b30";
      item.style.borderColor=ok?"#34c759":"#ff3b30";
      var fb=item.querySelector(".vf-feedback");if(fb)fb.style.display="block";
      checkVFComplete();
    };
  });

  // === REVEAL ===
  document.querySelectorAll(".reveal-card").forEach(function(c){
    c._origHTML=c.innerHTML;
    c.onclick=function(){
      if(c.classList.contains("revealed")){c.classList.remove("revealed");c.innerHTML=c._origHTML;}
      else{c.classList.add("revealed");c.innerHTML=c.dataset.content+'<span class="reveal-label">Cliquez pour fermer</span>';}
    };
  });

  // === BLANKS (block re-selection of filled slots, unlock after ALL filled) ===
  document.querySelectorAll(".blanks-container").forEach(function(ct){
    var activeSlot=null;
    ct.querySelectorAll(".blank-slot").forEach(function(s){
      s.onclick=function(){if(s.classList.contains("filled"))return;activeSlot=s;
        ct.querySelectorAll(".blank-slot").forEach(function(x){x.style.outline="";});s.style.outline="2px solid #0071e3";};
    });
    ct.querySelectorAll(".blank-option").forEach(function(o){
      o.onclick=function(){if(!activeSlot||o.classList.contains("used"))return;
        activeSlot.textContent=o.textContent;activeSlot.classList.add("filled");o.classList.add("used");scoreTotal++;
        if(activeSlot.dataset.answer===o.dataset.value){score++;activeSlot.style.color="#34c759";activeSlot.style.borderColor="#34c759";}
        else{activeSlot.style.color="#ff3b30";activeSlot.style.borderColor="#ff3b30";weakSet.add("Texte \u00e0 trous");}
        activeSlot.style.outline="";activeSlot=null;
        // Check all blanks filled
        var allFilled=ct.querySelectorAll(".blank-slot:not(.filled)").length===0;
        if(allFilled) markStepDone();
      };
    });
  });

  // === DEBATE ===
  document.querySelectorAll(".debate-side").forEach(function(s){
    s.onclick=function(){var ct=s.closest(".debate-container");if(ct.dataset.done)return;ct.dataset.done="1";
      s.style.borderColor="#0071e3";s.style.background="rgba(0,113,227,.04)";
      var rv=ct.querySelector(".debate-reveal");if(rv)rv.style.display="block";
      markStepDone();
    };
  });

  // === CHECKLIST (unlock after 2+ checked) ===
  document.querySelectorAll(".checklist-container").forEach(function(ct){
    ct.querySelectorAll(".checklist-item").forEach(function(it){
      it.onclick=function(){it.classList.toggle("checked");
        var n=ct.querySelectorAll(".checklist-item.checked").length,t=ct.querySelectorAll(".checklist-item").length;
        var pr=ct.querySelector(".checklist-progress");if(pr)pr.textContent=n+"/"+t+" engagements pris";
        if(n>=Math.min(2,t)) markStepDone();
      };
    });
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
    if(idx>=totalSteps-1) return;
    var nextLabel=navLabels[idx+1]||"suivante";
    var teasers=["Pr\u00eat \u00e0 explorer cet enjeu ?","Passons aux risques concrets.","D\u00e9couvrez comment y r\u00e9pondre.","Vivez une situation r\u00e9aliste.","Testez vos connaissances.","Voyons votre score.","Terminez en beaut\u00e9."];
    var previews=["M\u00e9canismes IA, usages concrets et principes cl\u00e9s.","Les risques identifi\u00e9s avec des exemples r\u00e9els.","Des mesures concr\u00e8tes avec des activit\u00e9s interactives.","Un sc\u00e9nario professionnel.","Un quiz pour valider vos acquis.","Votre synth\u00e8se personnalis\u00e9e.","Votre badge de compl\u00e9tion."];
    /* CTA removed */
    cta.innerHTML="<div class='next-teaser'>\u2705 Section termin\u00e9e</div><div class='next-title'>"+(teasers[idx]||"")+"</div><div class='next-preview'>"+(previews[idx]||"")+"</div><button class='step-next-btn' data-goto='"+(idx+1)+"'>Continuer vers "+nextLabel+" <span class='arrow'>\u2192</span></button>";
    
  });
  document.querySelectorAll(".step-next-btn").forEach(function(btn){btn.onclick=function(){var t=parseInt(btn.dataset.goto);if(!isNaN(t))go(t);};});

  // === STEP 0 : unlock only after VF ===
  // (handled by checkVFComplete - step 0 starts locked, VF completion unlocks it)
  // Step 1 (discovery) is always unlocked (reading only)
  stepCompleted[1] = true;
  // Last step always unlocked
  stepCompleted[totalSteps-1] = true;

  // === START ===
  go(0);
});
