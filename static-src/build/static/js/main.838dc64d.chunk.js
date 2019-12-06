(this.webpackJsonptictactoe=this.webpackJsonptictactoe||[]).push([[0],{123:function(e,t,a){"use strict";a.r(t);var n=a(0),s=a.n(n),i=a(20),o=a.n(i),c=a(30),r=a(6),l=a(7),u=a(8),h=a(10),m=a(9),E=a(11),p=(a(66),a(57)),d=a.n(p),v=a(58),b=a.n(v),O=a(16),f=a(14),y=a(19),T=a(31),M=a(59);y.b.add(T.b,T.a);var j=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(h.a)(this,Object(m.a)(t).call(this,e))).state={text:"LOADING"},a}return Object(E.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return s.a.createElement("h1",null,this.state.text)}}]),t}(s.a.Component),S=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(h.a)(this,Object(m.a)(t).call(this,e))).state={move:a.props.type},a.MOVE_TYPE=a.props.options,a}return Object(E.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){var e;switch(this.state.move){case this.MOVE_TYPE._:return s.a.createElement(s.a.Fragment,null);case this.MOVE_TYPE.O:e="O";break;case this.MOVE_TYPE.X:e="X"}return s.a.createElement("div",{className:"move"},e)}}],[{key:"getDerivedStateFromProps",value:function(e,t){return e.type!==t.move?{move:e.type}:null}}]),t}(s.a.Component),N=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(h.a)(this,Object(m.a)(t).call(this,e))).MOVE_TYPE={_:-1,X:0,O:1},a.TURN={OTHER:0,THIS:1},a.possibleMoves={f:0,s:1,t:2},a.possibleMoveArray=["f","s","t"],a.state={boardState:{ff:a.MOVE_TYPE._,fs:a.MOVE_TYPE._,ft:a.MOVE_TYPE._,sf:a.MOVE_TYPE._,ss:a.MOVE_TYPE._,st:a.MOVE_TYPE._,tf:a.MOVE_TYPE._,ts:a.MOVE_TYPE._,tt:a.MOVE_TYPE._},gameStatus:{connected:!1,won:{status:!1,result:null},turn:null}},a.onUserMove=a.onUserMove.bind(Object(r.a)(a)),a.onGameMove=a.onGameMove.bind(Object(r.a)(a)),a.onGameEnd=a.onGameEnd.bind(Object(r.a)(a)),a.updateBoard=a.updateBoard.bind(Object(r.a)(a)),a}return Object(E.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){var e=Object(c.a)(o.a.mark((function e(){var t;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,b.a.post("/api/game/ai",{data:JSON.stringify({playerType:this.props.playerType})});case 3:(t=e.sent.data).ai&&t.valid&&(this.pid=t.pid,this.gid=t.gid,this.playerType=t.playerType),e.next=9;break;case 7:e.prev=7,e.t0=e.catch(0);case 9:this.socket=d()(),this.socket.emit("request::ai",{game:this.gid,player:this.pid,playerType:this.playerType}),this.socket.on("player::move",this.onGameMove),this.socket.on("game::end",this.onGameEnd);case 13:case"end":return e.stop()}}),e,this,[[0,7]])})));return function(){return e.apply(this,arguments)}}()},{key:"onUserMove",value:function(e){var t=e.currentTarget.getAttribute("data-location"),a=t[0],n=t[1];if(n in this.possibleMoves&&a in this.possibleMoves&&this.state.boardState[t]===this.MOVE_TYPE._&&this.state.gameStatus.turn===this.TURN.THIS){var s=this.possibleMoves[a],i=this.possibleMoves[n];this.socket.emit("player::move",{myMove:[s,i],pid:this.pid,gid:this.gid})}}},{key:"onGameMove",value:function(e){if(e.requestMove){var t=Object.assign({},this.state.gameStatus);t.turn=this.TURN.THIS,this.setState({gameStatus:t})}else if(e.responseMove){var a=e.boardState;this.updateBoard(a)}else if(e.updateMove){var n=e.boardState;this.updateBoard(n)}}},{key:"onGameEnd",value:function(){}},{key:"updateBoard",value:function(e){var t=this,a=this.possibleMoveArray,n=Object.assign({},this.state.boardState);e.forEach((function(e,s){e.forEach((function(e,i){if(e!=t.MOVE_TYPE._){var o=a[s],c=a[i];n[o+c]=e}}))})),this.setState({boardState:n})}},{key:"render",value:function(){return s.a.createElement("div",{className:"board"},s.a.createElement("div",{className:"row"},s.a.createElement("div",{className:"col","data-location":"ff",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.ff})),s.a.createElement("div",{className:"col middle","data-location":"fs",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.fs})),s.a.createElement("div",{className:"col","data-location":"ft",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.ft}))),s.a.createElement("div",{className:"row middle"},s.a.createElement("div",{className:"col","data-location":"sf",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.sf})),s.a.createElement("div",{className:"col middle","data-location":"ss",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.ss})),s.a.createElement("div",{className:"col","data-location":"st",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.st}))),s.a.createElement("div",{className:"row"},s.a.createElement("div",{className:"col","data-location":"tf",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.tf})),s.a.createElement("div",{className:"col middle","data-location":"ts",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.ts})),s.a.createElement("div",{className:"col","data-location":"tt",onClick:this.onUserMove},s.a.createElement(S,{options:this.MOVE_TYPE,type:this.state.boardState.tt}))))}}]),t}(s.a.Component),_=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(h.a)(this,Object(m.a)(t).call(this,e))).humanGame=a.humanGame.bind(Object(r.a)(a)),a.aiGame=a.aiGame.bind(Object(r.a)(a)),a.information={ai:{label:"ROBO",icon:"robot",handle:a.aiGame},human:{label:"HUMAN",icon:"user",handle:a.humanGame}},a}return Object(E.a)(t,e),Object(u.a)(t,[{key:"humanGame",value:function(){}},{key:"aiGame",value:function(){}},{key:"render",value:function(){var e=this.props.type;return s.a.createElement("div",{className:e,onClick:this.information[e].handle},s.a.createElement(O.b,{to:"new/".concat(e)},s.a.createElement("div",{className:"icon"},s.a.createElement(M.a,{icon:this.information[e].icon})),s.a.createElement("div",{className:"label"},this.information[e].label)))}}]),t}(s.a.Component),k=function(e){function t(){return Object(l.a)(this,t),Object(h.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(E.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return s.a.createElement("div",{className:"gameDetails"},s.a.createElement("div",{className:"title"},s.a.createElement("h1",null,"AGAINST")),s.a.createElement("div",{className:"options"},s.a.createElement(O.a,null,s.a.createElement(_,{type:"human"}),s.a.createElement(_,{type:"ai"}))))}}]),t}(s.a.Component),P=function(e){function t(){return Object(l.a)(this,t),Object(h.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(E.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return s.a.createElement("div",null,"Enter Your Name Here")}}]),t}(s.a.Component),Y=function(e){function t(){return Object(l.a)(this,t),Object(h.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(E.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return s.a.createElement(O.a,null,s.a.createElement(f.a,{exact:!0,path:"/"},s.a.createElement("div",{className:"menu"},s.a.createElement("div",{className:"title"},s.a.createElement("h1",null,"Tic Tac Toe")),s.a.createElement("div",{className:"options"},s.a.createElement(O.a,null,s.a.createElement(O.b,{to:"new"},s.a.createElement("div",{className:"new"},"NEW GAME")),s.a.createElement(O.b,{to:"/join"},s.a.createElement("div",{className:"join"},"JOIN GAME")))))),s.a.createElement(f.a,{exact:!0,path:"/new"},s.a.createElement(k,null)),s.a.createElement(f.a,{exact:!0,path:"/new/human"},s.a.createElement(w,null)),s.a.createElement(f.a,{exact:!0,path:"/new/ai"},s.a.createElement(w,{ai:!0})))}}]),t}(s.a.Component),A=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(h.a)(this,Object(m.a)(t).call(this,e))).onSelect=a.onSelect.bind(Object(r.a)(a)),a.x=s.a.createRef(),a.o=s.a.createRef(),a}return Object(E.a)(t,e),Object(u.a)(t,[{key:"onSelect",value:function(e){var t=e.currentTarget;this.x.current==t?this.props.onSelect(this.props.options.X):this.o.current==t&&this.props.onSelect(this.props.options.O)}},{key:"render",value:function(){return s.a.createElement("div",{className:"role-select"},s.a.createElement("div",{className:"title"},s.a.createElement("h1",null,"PLAYER TYPE")),s.a.createElement("div",{className:"tiles"},s.a.createElement("div",{className:"roles x",ref:this.x,onClick:this.onSelect},"X"),s.a.createElement("div",{className:"roles o",ref:this.o,onClick:this.onSelect},"O")))}}]),t}(s.a.Component),w=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(h.a)(this,Object(m.a)(t).call(this,e))).showStates={LOADING:0,ROLESELECT:1,HUMANNAME:2,GAMEINIT:3},a.state={SHOW_STATE:a.showStates.LOADING},a.PLAYER_TYPE={X:0,O:1},a.playerType=null,a.onRoleSelect=a.onRoleSelect.bind(Object(r.a)(a)),a}return Object(E.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){this.props.ai?this.setState({SHOW_STATE:this.showStates.ROLESELECT}):this.setState({SHOW_STATE:this.showStates.HUMANNAME})}},{key:"onRoleSelect",value:function(){var e=Object(c.a)(o.a.mark((function e(t){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:this.PLAYER_TYPE.X!==t&&this.PLAYER_TYPE.O!==t||(this.playerType=t,this.setState({SHOW_STATE:this.showStates.GAMEINIT}));case 1:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e;switch(this.state.SHOW_STATE){case this.showStates.LOADING:e=s.a.createElement(j,null);break;case this.showStates.ROLESELECT:e=s.a.createElement(A,{onSelect:this.onRoleSelect,options:this.PLAYER_TYPE});break;case this.showStates.GAMEINIT:e=s.a.createElement(N,{ai:this.props.ai,playerType:this.playerType,options:this.PLAYER_TYPE});break;case this.showStates.HUMANNAME:e=s.a.createElement(P,null)}return e}}]),t}(s.a.Component),G=function(e){function t(){return Object(l.a)(this,t),Object(h.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(E.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return s.a.createElement(Y,null)}}]),t}(s.a.Component),C=a(62);a.n(C).a.render(s.a.createElement(G,null),document.getElementById("root"))},63:function(e,t,a){e.exports=a(123)},66:function(e,t,a){},95:function(e,t){}},[[63,1,2]]]);
//# sourceMappingURL=main.838dc64d.chunk.js.map