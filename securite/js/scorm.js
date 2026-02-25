var scormAPI=null;
function findSCORMAPI(w){try{var a=0;while(w&&!w.API&&a<10){if(w.parent&&w.parent!==w)w=w.parent;else if(w.opener)w=w.opener;else break;a++}return w?w.API:null;}catch(e){return null;}}
function initSCORM(){try{scormAPI=findSCORMAPI(window);if(scormAPI){scormAPI.LMSInitialize("");var s=scormAPI.LMSGetValue("cmi.core.lesson_status");if(s===""||s==="not attempted"){scormAPI.LMSSetValue("cmi.core.lesson_status","incomplete");scormAPI.LMSCommit("")}}}catch(e){scormAPI=null;}}
function setSCORMComplete(){try{if(scormAPI){scormAPI.LMSSetValue("cmi.core.lesson_status","completed");scormAPI.LMSSetValue("cmi.core.score.raw","100");scormAPI.LMSSetValue("cmi.core.score.min","0");scormAPI.LMSSetValue("cmi.core.score.max","100");scormAPI.LMSCommit("")}}catch(e){}}
function setSCORMScore(s){try{if(scormAPI){scormAPI.LMSSetValue("cmi.core.score.raw",String(Math.round(s)));scormAPI.LMSSetValue("cmi.core.score.min","0");scormAPI.LMSSetValue("cmi.core.score.max","100");scormAPI.LMSCommit("")}}catch(e){}}
function setSCORMLocation(l){try{if(scormAPI){scormAPI.LMSSetValue("cmi.core.lesson_location",String(l));scormAPI.LMSCommit("")}}catch(e){}}
function getSCORMLocation(){try{return scormAPI?scormAPI.LMSGetValue("cmi.core.lesson_location"):"";}catch(e){return"";}}
function setSCORMSuspend(d){try{if(scormAPI){scormAPI.LMSSetValue("cmi.suspend_data",d);scormAPI.LMSCommit("")}}catch(e){}}
function getSCORMSuspend(){try{return scormAPI?scormAPI.LMSGetValue("cmi.suspend_data"):"";}catch(e){return"";}}
function terminateSCORM(){try{if(scormAPI)scormAPI.LMSFinish("")}catch(e){}}
window.addEventListener("beforeunload",terminateSCORM);
