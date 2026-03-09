var scormAPI=null;
function findSCORMAPI(w){try{var a=0;while(w&&!w.API_1484_11&&a<10){if(w.parent&&w.parent!==w)w=w.parent;else if(w.opener)w=w.opener;else break;a++}return w?w.API_1484_11:null;}catch(e){return null;}}
function initSCORM(){try{scormAPI=findSCORMAPI(window);if(scormAPI){scormAPI.Initialize("");var s=scormAPI.GetValue("cmi.completion_status");if(s===""||s==="unknown"||s==="not attempted"){scormAPI.SetValue("cmi.completion_status","incomplete");scormAPI.Commit("")}}}catch(e){scormAPI=null;}}
function setSCORMComplete(){try{if(scormAPI){scormAPI.SetValue("cmi.completion_status","completed");scormAPI.SetValue("cmi.success_status","passed");scormAPI.Commit("")}}catch(e){}}
function setSCORMScore(s){try{if(scormAPI){scormAPI.SetValue("cmi.score.raw",String(Math.round(s)));scormAPI.SetValue("cmi.score.min","0");scormAPI.SetValue("cmi.score.max","100");scormAPI.SetValue("cmi.score.scaled",String(Math.round(s)/100));scormAPI.Commit("")}}catch(e){}}
function setSCORMLocation(l){try{if(scormAPI){scormAPI.SetValue("cmi.location",String(l));scormAPI.Commit("")}}catch(e){}}
function getSCORMLocation(){try{return scormAPI?scormAPI.GetValue("cmi.location"):"";}catch(e){return"";}}
function setSCORMSuspend(d){try{if(scormAPI){scormAPI.SetValue("cmi.suspend_data",d);scormAPI.Commit("")}}catch(e){}}
function getSCORMSuspend(){try{return scormAPI?scormAPI.GetValue("cmi.suspend_data"):"";}catch(e){return"";}}
function terminateSCORM(){try{if(scormAPI)scormAPI.Terminate("")}catch(e){}}
window.addEventListener("beforeunload",terminateSCORM);
