/*
 2013 Jason Mulligan
 @license BSD-3 <https://raw.github.com/avoidwork/keysort/master/LICENSE>
 @link http://avoidwork.github.io/keysort/
 @module keysort
 @version 0.1.1
*/
(function(f){function g(d,a){var b=d.length,c;for(c=0;c<b&&!1!==a.call(d,d[c],c);c++);return d}function h(d,a){a=a||",";return d.replace(/^(\s+|\t+)|(\s+|\t+)$/g,"").split(RegExp("\\s*"+a+"\\s*"))}function e(d,a,b){a=a.replace(/\s*asc/ig,"").replace(/\s*desc/ig," desc");a=h(a).map(function(b){return b.split(" ")});var c=[];b=b&&""!==b?"."+b:"";g(a,function(a){"desc"!==a[1]?(c.push("if ( a"+b+'["'+a[0]+'"] < b'+b+'["'+a[0]+'"] ) return -1;'),c.push("if ( a"+b+'["'+a[0]+'"] > b'+b+'["'+a[0]+'"] ) return 1;')):
(c.push("if ( a"+b+'["'+a[0]+'"] < b'+b+'["'+a[0]+'"] ) return 1;'),c.push("if ( a"+b+'["'+a[0]+'"] > b'+b+'["'+a[0]+'"] ) return -1;'))});c.push("else return 0;");return d.sort(new Function("a","b",c.join("\n")))}"undefined"!==typeof exports?module.exports=e:"function"===typeof define?define(function(){return e}):f.keysort=e})(this);
//@ sourceMappingURL=keysort.map