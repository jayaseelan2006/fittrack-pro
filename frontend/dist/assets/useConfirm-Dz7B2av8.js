import{c as i,j as t}from"./index-ZXDSbn3Q.js";import{r as n}from"./vendor-DX9ErTJF.js";import{M as m}from"./Modal-Dd-iMM-m.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=i("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);function h(){const[e,a]=n.useState(null),o=n.useCallback(s=>new Promise(c=>a({...typeof s=="string"?{message:s}:s,resolve:c})),[]),r=s=>{e.resolve(s),a(null)},l=e&&t.jsx(m,{title:e.title||"Are you sure?",size:"sm",onClose:()=>r(!1),footer:t.jsxs(t.Fragment,{children:[t.jsx("button",{className:"btn-ghost",onClick:()=>r(!1),children:"Cancel"}),t.jsx("button",{className:e.danger===!1?"btn-primary":"btn-danger",onClick:()=>r(!0),children:e.confirmText||"Delete"})]}),children:t.jsx("p",{className:"text-sm text-muted",children:e.message})});return[o,l]}export{f as T,h as u};
