/*** 
* Thanks MDN https://developer.mozilla.org/en/Parsing_and_serializing_XML
**/
(function(w){
	
	function buildValue (sValue) {
	  if (/^\s*$/.test(sValue)) { return null; }
	  if (/^(true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
	  if (isFinite(sValue)) { return parseFloat(sValue); }
	  if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
	  return sValue;
	}

	function objectify (vValue) {
	  if (vValue === null) {
	    return new (function() {
	      // this.toString = function() { return "null"; }
	      // 	      this.valueOf = function() { return null; }
	    })();
	  }
	  return vValue instanceof Object ? vValue : new vValue.constructor(vValue);
	}

	var aTmpEls = []; // loaded element nodes cache

	function getJXONData (oXMLParent) {
	  var  sItKey, sItVal, vResult, nLength = 0, nLevelStart = aTmpEls.length,
	       nChildren = oXMLParent.hasChildNodes() ? oXMLParent.childNodes.length : 0, sCollectedTxt = "";

	  for (var oItChild, nChildId = 0; nChildId < nChildren; nChildId++) {
	    oItChild = oXMLParent.childNodes.item(nChildId);
	    if (oItChild.nodeType === 4) { sCollectedTxt += oItChild.nodeValue; } /* nodeType is "CDATASection" (4) */
	    else if (oItChild.nodeType === 3) { sCollectedTxt += oItChild.nodeValue.replace(/^\s+|\s+$/g, ""); } /* nodeType is "Text" (3) */
	    else if (oItChild.nodeType === 1 && !oItChild.prefix) { aTmpEls.push(oItChild); } /* nodeType is "Element" (1) */
	  }

	  var nLevelEnd = aTmpEls.length, vBuiltVal = buildValue(sCollectedTxt);

	  if (oXMLParent.hasAttributes()) {
	    vResult = objectify(vBuiltVal);
	    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
	      oItAttr = oXMLParent.attributes.item(nLength);
	      vResult["@" + oItAttr.nodeName.toLowerCase()] = buildValue(oItAttr.nodeValue.replace(/^\s+|\s+$/g, ""));
	    }
	  } else if (nLevelEnd > nLevelStart) { vResult = objectify(vBuiltVal); }

	  for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
	    sItKey = aTmpEls[nElId].nodeName.toLowerCase();
	    sItVal = getJXONData(aTmpEls[nElId]);
	    if (vResult.hasOwnProperty(sItKey)) {
	    if (vResult[sItKey].constructor !== Array) { vResult[sItKey] = [vResult[sItKey]]; }
	      vResult[sItKey].push(sItVal);
	    } else { vResult[sItKey] = sItVal; nLength++; }
	  }

	  aTmpEls.length = nLevelStart;

	  if (nLength === 0) { vResult = sCollectedTxt ? vBuiltVal : /* put here the default value for empty nodes: */ true; }
	  /* else { Object.freeze(vResult); } */

	  return vResult;
	}
	window.JXON = {}
	window.JXON.parser = function(doc){
		aTmpEls = [];
		return getJXONData(doc);
	}
})(window);
