var st=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function tt(f){return f&&f.__esModule&&Object.prototype.hasOwnProperty.call(f,"default")?f.default:f}var O={exports:{}},r={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var B;function et(){if(B)return r;B=1;var f=Symbol.for("react.transitional.element"),l=Symbol.for("react.portal"),h=Symbol.for("react.fragment"),d=Symbol.for("react.strict_mode"),k=Symbol.for("react.profiler"),_=Symbol.for("react.consumer"),g=Symbol.for("react.context"),w=Symbol.for("react.forward_ref"),T=Symbol.for("react.suspense"),A=Symbol.for("react.memo"),R=Symbol.for("react.lazy"),K=Symbol.for("react.activity"),b=Symbol.iterator;function W(t){return t===null||typeof t!="object"?null:(t=b&&t[b]||t["@@iterator"],typeof t=="function"?t:null)}var $={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},L=Object.assign,N={};function E(t,e,o){this.props=t,this.context=e,this.refs=N,this.updater=o||$}E.prototype.isReactComponent={},E.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")},E.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function I(){}I.prototype=E.prototype;function x(t,e,o){this.props=t,this.context=e,this.refs=N,this.updater=o||$}var M=x.prototype=new I;M.constructor=x,L(M,E.prototype),M.isPureReactComponent=!0;var Y=Array.isArray;function S(){}var i={H:null,A:null,T:null,S:null},q=Object.prototype.hasOwnProperty;function H(t,e,o){var n=o.ref;return{$$typeof:f,type:t,key:e,ref:n!==void 0?n:null,props:o}}function X(t,e){return H(t.type,e,t.props)}function j(t){return typeof t=="object"&&t!==null&&t.$$typeof===f}function Z(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(o){return e[o]})}var z=/\/+/g;function P(t,e){return typeof t=="object"&&t!==null&&t.key!=null?Z(""+t.key):e.toString(36)}function Q(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(S,S):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function v(t,e,o,n,u){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var c=!1;if(t===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(t.$$typeof){case f:case l:c=!0;break;case R:return c=t._init,v(c(t._payload),e,o,n,u)}}if(c)return u=u(t),c=n===""?"."+P(t,0):n,Y(u)?(o="",c!=null&&(o=c.replace(z,"$&/")+"/"),v(u,e,o,"",function(F){return F})):u!=null&&(j(u)&&(u=X(u,o+(u.key==null||t&&t.key===u.key?"":(""+u.key).replace(z,"$&/")+"/")+c)),e.push(u)),1;c=0;var y=n===""?".":n+":";if(Y(t))for(var p=0;p<t.length;p++)n=t[p],s=y+P(n,p),c+=v(n,e,o,s,u);else if(p=W(t),typeof p=="function")for(t=p.call(t),p=0;!(n=t.next()).done;)n=n.value,s=y+P(n,p++),c+=v(n,e,o,s,u);else if(s==="object"){if(typeof t.then=="function")return v(Q(t),e,o,n,u);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return c}function C(t,e,o){if(t==null)return t;var n=[],u=0;return v(t,n,"","",function(s){return e.call(o,s,u++)}),n}function J(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(o){(t._status===0||t._status===-1)&&(t._status=1,t._result=o)},function(o){(t._status===0||t._status===-1)&&(t._status=2,t._result=o)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var U=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},V={map:C,forEach:function(t,e,o){C(t,function(){e.apply(this,arguments)},o)},count:function(t){var e=0;return C(t,function(){e++}),e},toArray:function(t){return C(t,function(e){return e})||[]},only:function(t){if(!j(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};return r.Activity=K,r.Children=V,r.Component=E,r.Fragment=h,r.Profiler=k,r.PureComponent=x,r.StrictMode=d,r.Suspense=T,r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,r.__COMPILER_RUNTIME={__proto__:null,c:function(t){return i.H.useMemoCache(t)}},r.cache=function(t){return function(){return t.apply(null,arguments)}},r.cacheSignal=function(){return null},r.cloneElement=function(t,e,o){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var n=L({},t.props),u=t.key;if(e!=null)for(s in e.key!==void 0&&(u=""+e.key),e)!q.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(n[s]=e[s]);var s=arguments.length-2;if(s===1)n.children=o;else if(1<s){for(var c=Array(s),y=0;y<s;y++)c[y]=arguments[y+2];n.children=c}return H(t.type,u,n)},r.createContext=function(t){return t={$$typeof:g,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:_,_context:t},t},r.createElement=function(t,e,o){var n,u={},s=null;if(e!=null)for(n in e.key!==void 0&&(s=""+e.key),e)q.call(e,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(u[n]=e[n]);var c=arguments.length-2;if(c===1)u.children=o;else if(1<c){for(var y=Array(c),p=0;p<c;p++)y[p]=arguments[p+2];u.children=y}if(t&&t.defaultProps)for(n in c=t.defaultProps,c)u[n]===void 0&&(u[n]=c[n]);return H(t,s,u)},r.createRef=function(){return{current:null}},r.forwardRef=function(t){return{$$typeof:w,render:t}},r.isValidElement=j,r.lazy=function(t){return{$$typeof:R,_payload:{_status:-1,_result:t},_init:J}},r.memo=function(t,e){return{$$typeof:A,type:t,compare:e===void 0?null:e}},r.startTransition=function(t){var e=i.T,o={};i.T=o;try{var n=t(),u=i.S;u!==null&&u(o,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(S,U)}catch(s){U(s)}finally{e!==null&&o.types!==null&&(e.types=o.types),i.T=e}},r.unstable_useCacheRefresh=function(){return i.H.useCacheRefresh()},r.use=function(t){return i.H.use(t)},r.useActionState=function(t,e,o){return i.H.useActionState(t,e,o)},r.useCallback=function(t,e){return i.H.useCallback(t,e)},r.useContext=function(t){return i.H.useContext(t)},r.useDebugValue=function(){},r.useDeferredValue=function(t,e){return i.H.useDeferredValue(t,e)},r.useEffect=function(t,e){return i.H.useEffect(t,e)},r.useEffectEvent=function(t){return i.H.useEffectEvent(t)},r.useId=function(){return i.H.useId()},r.useImperativeHandle=function(t,e,o){return i.H.useImperativeHandle(t,e,o)},r.useInsertionEffect=function(t,e){return i.H.useInsertionEffect(t,e)},r.useLayoutEffect=function(t,e){return i.H.useLayoutEffect(t,e)},r.useMemo=function(t,e){return i.H.useMemo(t,e)},r.useOptimistic=function(t,e){return i.H.useOptimistic(t,e)},r.useReducer=function(t,e,o){return i.H.useReducer(t,e,o)},r.useRef=function(t){return i.H.useRef(t)},r.useState=function(t){return i.H.useState(t)},r.useSyncExternalStore=function(t,e,o){return i.H.useSyncExternalStore(t,e,o)},r.useTransition=function(){return i.H.useTransition()},r.version="19.2.4",r}var D;function rt(){return D||(D=1,O.exports=et()),O.exports}var m=rt();const it=tt(m);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=f=>f.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),G=(...f)=>f.filter((l,h,d)=>!!l&&l.trim()!==""&&d.indexOf(l)===h).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ot={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=m.forwardRef(({color:f="currentColor",size:l=24,strokeWidth:h=2,absoluteStrokeWidth:d,className:k="",children:_,iconNode:g,...w},T)=>m.createElement("svg",{ref:T,...ot,width:l,height:l,stroke:f,strokeWidth:d?Number(h)*24/Number(l):h,className:G("lucide",k),...w},[...g.map(([A,R])=>m.createElement(A,R)),...Array.isArray(_)?_:[_]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=(f,l)=>{const h=m.forwardRef(({className:d,...k},_)=>m.createElement(ut,{ref:_,iconNode:l,className:G(`lucide-${nt(f)}`,d),...k}));return h.displayName=`${f}`,h};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=a("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=a("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=a("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=a("Bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=a("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=a("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=a("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=a("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=a("EllipsisVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=a("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=a("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=a("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=a("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=a("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=a("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=a("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=a("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=a("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);export{at as A,pt as B,ht as C,Et as E,vt as H,kt as P,it as R,Ct as S,gt as T,Tt as X,m as a,wt as b,st as c,ft as d,ct as e,dt as f,tt as g,yt as h,lt as i,_t as j,mt as k,Rt as l,rt as r};
