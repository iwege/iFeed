/**
 * Adapted from
 * Connect - utils
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 * 
 * Merge object b with object a.
 *
 * var a = { foo: 'bar' }
 * , b = { foo: 'quux', bar: 'baz' };
 *
 * Object.merge(a, b);
 * // => { foo: 'bar', bar: 'baz' }
 *
 * Object.merge(a, b, true);
 * // => { foo: 'quux', bar: 'baz' }
 * 
 * @param {Object} a
 * @param {Object} b
 * @param {Boolean} [force] Optionally, overwrite any existing keys in a found in b
 * @return {Object}
 */
if(!Object.merge) Object.merge = function(a, b, force){
  if (a && b) {
    if (a !== Object(a) || b !== Object(b)) {
      throw new TypeError('Object.merge called on non-object');
    }
    for (var key in b) {
      if(force || !a.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
};

Array.unique = function (array){
  var a = [];
  var l = array.length;
  for(var i=0; i<l; i++) {
    for(var j=i+1; j<l; j++) {
      // If this[i] is found later in the array
      if (array[i] === array[j])
        j = ++i;
    }
    a.push(array[i]);
  }
  return a;
};

// Utility function to test for and extract a subkey
function getValue(obj, subkey) {
  if (!subkey)
    subkey = '#';
  if (obj && obj[subkey])
    return obj[subkey];
  else
    return null;
}


// wrapper for non-node envs
;(function (sax) {

sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
sax.SAXParser = SAXParser
sax.SAXStream = SAXStream
sax.createStream = createStream

// When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
// When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
// since that's the earliest that a buffer overrun could occur.  This way, checks are
// as rare as required, but as often as necessary to ensure never crossing this bound.
// Furthermore, buffers are only tested at most once per write(), so passing a very
// large string into write() might have undesirable effects, but this is manageable by
// the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
// edge case, result in creating at most one complete copy of the string passed in.
// Set to Infinity to have unlimited buffers.
sax.MAX_BUFFER_LENGTH = 64 * 1024

var buffers = [
  "comment", "sgmlDecl", "textNode", "tagName", "doctype",
  "procInstName", "procInstBody", "entity", "attribName",
  "attribValue", "cdata", "script"
]

sax.EVENTS = // for discoverability.
  [ "text"
  , "processinginstruction"
  , "sgmldeclaration"
  , "doctype"
  , "comment"
  , "attribute"
  , "opentag"
  , "closetag"
  , "opencdata"
  , "cdata"
  , "closecdata"
  , "error"
  , "end"
  , "ready"
  , "script"
  , "opennamespace"
  , "closenamespace"
  ]

function SAXParser (strict, opt) {
  if (!(this instanceof SAXParser)) return new SAXParser(strict, opt)

  var parser = this
  clearBuffers(parser)
  parser.q = parser.c = ""
  parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
  parser.opt = opt || {}
  parser.tagCase = parser.opt.lowercasetags ? "toLowerCase" : "toUpperCase"
  parser.tags = []
  parser.closed = parser.closedRoot = parser.sawRoot = false
  parser.tag = parser.error = null
  parser.strict = !!strict
  parser.noscript = !!(strict || parser.opt.noscript)
  parser.state = S.BEGIN
  parser.ENTITIES = Object.create(sax.ENTITIES)
  parser.attribList = []

  // namespaces form a prototype chain.
  // it always points at the current tag,
  // which protos to its parent tag.
  if (parser.opt.xmlns) parser.ns = Object.create(rootNS)

  // mostly just for error reporting
  parser.position = parser.line = parser.column = 0
  emit(parser, "onready")
}

if (!Object.create) Object.create = function (o) {
  function f () { this.__proto__ = o }
  f.prototype = o
  return new f
}

if (!Object.getPrototypeOf) Object.getPrototypeOf = function (o) {
  return o.__proto__
}

if (!Object.keys) Object.keys = function (o) {
  var a = []
  for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
  return a
}

function checkBufferLength (parser) {
  var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    , maxActual = 0
  for (var i = 0, l = buffers.length; i < l; i ++) {
    var len = parser[buffers[i]].length
    if (len > maxAllowed) {
      // Text/cdata nodes can get big, and since they're buffered,
      // we can get here under normal conditions.
      // Avoid issues by emitting the text node now,
      // so at least it won't get any bigger.
      switch (buffers[i]) {
        case "textNode":
          closeText(parser)
        break

        case "cdata":
          emitNode(parser, "oncdata", parser.cdata)
          parser.cdata = ""
        break

        case "script":
          emitNode(parser, "onscript", parser.script)
          parser.script = ""
        break

        default:
          error(parser, "Max buffer length exceeded: "+buffers[i])
      }
    }
    maxActual = Math.max(maxActual, len)
  }
  // schedule the next check for the earliest possible buffer overrun.
  parser.bufferCheckPosition = (sax.MAX_BUFFER_LENGTH - maxActual)
                             + parser.position
}

function clearBuffers (parser) {
  for (var i = 0, l = buffers.length; i < l; i ++) {
    parser[buffers[i]] = ""
  }
}

SAXParser.prototype =
  { end: function () { end(this) }
  , write: write
  , resume: function () { this.error = null; return this }
  , close: function () { return this.write(null) }
  }

try {
  var Stream = require("stream").Stream
} catch (ex) {
  var Stream = function () {}
}


var streamWraps = sax.EVENTS.filter(function (ev) {
  return ev !== "error" && ev !== "end"
})

function createStream (strict, opt) {
  return new SAXStream(strict, opt)
}

function SAXStream (strict, opt) {
  if (!(this instanceof SAXStream)) return new SAXStream(strict, opt)

  Stream.apply(me)

  this._parser = new SAXParser(strict, opt)
  this.writable = true
  this.readable = true


  var me = this

  this._parser.onend = function () {
    me.emit("end")
  }

  this._parser.onerror = function (er) {
    me.emit("error", er)

    // if didn't throw, then means error was handled.
    // go ahead and clear error, so we can write again.
    me._parser.error = null
  }

  streamWraps.forEach(function (ev) {
    Object.defineProperty(me, "on" + ev, {
      get: function () { return me._parser["on" + ev] },
      set: function (h) {
        if (!h) {
          me.removeAllListeners(ev)
          return me._parser["on"+ev] = h
        }
        me.on(ev, h)
      },
      enumerable: true,
      configurable: false
    })
  })
}

SAXStream.prototype = Object.create(Stream.prototype,
  { constructor: { value: SAXStream } })

SAXStream.prototype.write = function (data) {
  this._parser.write(data.toString())
  this.emit("data", data)
  return true
}

SAXStream.prototype.end = function (chunk) {
  if (chunk && chunk.length) this._parser.write(chunk.toString())
  this._parser.end()
  return true
}

SAXStream.prototype.on = function (ev, handler) {
  var me = this
  if (!me._parser["on"+ev] && streamWraps.indexOf(ev) !== -1) {
    me._parser["on"+ev] = function () {
      var args = arguments.length === 1 ? [arguments[0]]
               : Array.apply(null, arguments)
      args.splice(0, 0, ev)
      me.emit.apply(me, args)
    }
  }

  return Stream.prototype.on.call(me, ev, handler)
}



// character classes and tokens
var whitespace = "\r\n\t "
  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  , number = "0124356789"
  , letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  // (Letter | "_" | ":")
  , nameStart = letter+"_:"
  , nameBody = nameStart+number+"-."
  , quote = "'\""
  , entity = number+letter+"#"
  , attribEnd = whitespace + ">"
  , CDATA = "[CDATA["
  , DOCTYPE = "DOCTYPE"
  , XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace"
  , XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/"
  , rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

// turn all the string character sets into character class objects.
whitespace = charClass(whitespace)
number = charClass(number)
letter = charClass(letter)
nameStart = charClass(nameStart)
nameBody = charClass(nameBody)
quote = charClass(quote)
entity = charClass(entity)
attribEnd = charClass(attribEnd)

function charClass (str) {
  return str.split("").reduce(function (s, c) {
    s[c] = true
    return s
  }, {})
}

function is (charclass, c) {
  return charclass[c]
}

function not (charclass, c) {
  return !charclass[c]
}

var S = 0
sax.STATE =
{ BEGIN                     : S++
, TEXT                      : S++ // general stuff
, TEXT_ENTITY               : S++ // &amp and such.
, OPEN_WAKA                 : S++ // <
, SGML_DECL                 : S++ // <!BLARG
, SGML_DECL_QUOTED          : S++ // <!BLARG foo "bar
, DOCTYPE                   : S++ // <!DOCTYPE
, DOCTYPE_QUOTED            : S++ // <!DOCTYPE "//blah
, DOCTYPE_DTD               : S++ // <!DOCTYPE "//blah" [ ...
, DOCTYPE_DTD_QUOTED        : S++ // <!DOCTYPE "//blah" [ "foo
, COMMENT_STARTING          : S++ // <!-
, COMMENT                   : S++ // <!--
, COMMENT_ENDING            : S++ // <!-- blah -
, COMMENT_ENDED             : S++ // <!-- blah --
, CDATA                     : S++ // <![CDATA[ something
, CDATA_ENDING              : S++ // ]
, CDATA_ENDING_2            : S++ // ]]
, PROC_INST                 : S++ // <?hi
, PROC_INST_BODY            : S++ // <?hi there
, PROC_INST_QUOTED          : S++ // <?hi "there
, PROC_INST_ENDING          : S++ // <?hi "there" ?
, OPEN_TAG                  : S++ // <strong
, OPEN_TAG_SLASH            : S++ // <strong /
, ATTRIB                    : S++ // <a
, ATTRIB_NAME               : S++ // <a foo
, ATTRIB_NAME_SAW_WHITE     : S++ // <a foo _
, ATTRIB_VALUE              : S++ // <a foo=
, ATTRIB_VALUE_QUOTED       : S++ // <a foo="bar
, ATTRIB_VALUE_UNQUOTED     : S++ // <a foo=bar
, ATTRIB_VALUE_ENTITY_Q     : S++ // <foo bar="&quot;"
, ATTRIB_VALUE_ENTITY_U     : S++ // <foo bar=&quot;
, CLOSE_TAG                 : S++ // </a
, CLOSE_TAG_SAW_WHITE       : S++ // </a   >
, SCRIPT                    : S++ // <script> ...
, SCRIPT_ENDING             : S++ // <script> ... <
}

sax.ENTITIES =
{ "apos" : "'"
, "quot" : "\""
, "amp"  : "&"
, "gt"   : ">"
, "lt"   : "<"
}

for (var S in sax.STATE) sax.STATE[sax.STATE[S]] = S

// shorthand
S = sax.STATE

function emit (parser, event, data) {
  parser[event] && parser[event](data)
}

function emitNode (parser, nodeType, data) {
  if (parser.textNode) closeText(parser)
  emit(parser, nodeType, data)
}

function closeText (parser) {
  parser.textNode = textopts(parser.opt, parser.textNode)
  if (parser.textNode) emit(parser, "ontext", parser.textNode)
  parser.textNode = ""
}

function textopts (opt, text) {
  if (opt.trim) text = text.trim()
  if (opt.normalize) text = text.replace(/\s+/g, " ")
  return text
}

function error (parser, er) {
  closeText(parser)
  er += "\nLine: "+parser.line+
        "\nColumn: "+parser.column+
        "\nChar: "+parser.c
  er = new Error(er)
  parser.error = er
  emit(parser, "onerror", er)
  return parser
}

function end (parser) {
  if (parser.state !== S.TEXT) error(parser, "Unexpected end")
  closeText(parser)
  parser.c = ""
  parser.closed = true
  emit(parser, "onend")
  SAXParser.call(parser, parser.strict, parser.opt)
  return parser
}

function strictFail (parser, message) {
  if (parser.strict) error(parser, message)
}

function newTag (parser) {
  if (!parser.strict) parser.tagName = parser.tagName[parser.tagCase]()
  var parent = parser.tags[parser.tags.length - 1] || parser
    , tag = parser.tag = { name : parser.tagName, attributes : {} }

  // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
  if (parser.opt.xmlns) tag.ns = parent.ns
  parser.attribList.length = 0
}

function qname (name) {
  var i = name.indexOf(":")
    , qualName = i < 0 ? [ "", name ] : name.split(":")
    , prefix = qualName[0]
    , local = qualName[1]

  // <x "xmlns"="http://foo">
  if (name === "xmlns") {
    prefix = "xmlns"
    local = ""
  }

  return { prefix: prefix, local: local }
}

function attrib (parser) {
  if (parser.opt.xmlns) {
    var qn = qname(parser.attribName)
      , prefix = qn.prefix
      , local = qn.local

    if (prefix === "xmlns") {
      // namespace binding attribute; push the binding into scope
      if (local === "xml" && parser.attribValue !== XML_NAMESPACE) {
        strictFail( parser
                  , "xml: prefix must be bound to " + XML_NAMESPACE + "\n"
                  + "Actual: " + parser.attribValue )
      } else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) {
        strictFail( parser
                  , "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\n"
                  + "Actual: " + parser.attribValue )
      } else {
        var tag = parser.tag
          , parent = parser.tags[parser.tags.length - 1] || parser
        if (tag.ns === parent.ns) {
          tag.ns = Object.create(parent.ns)
        }
        tag.ns[local] = parser.attribValue
      }
    }

    // defer onattribute events until all attributes have been seen
    // so any new bindings can take effect; preserve attribute order
    // so deferred events can be emitted in document order
    parser.attribList.push([parser.attribName, parser.attribValue])
  } else {
    // in non-xmlns mode, we can emit the event right away
    parser.tag.attributes[parser.attribName] = parser.attribValue
    emitNode( parser
            , "onattribute"
            , { name: parser.attribName
              , value: parser.attribValue } )
  }

  parser.attribName = parser.attribValue = ""
}

function openTag (parser, selfClosing) {
  if (parser.opt.xmlns) {
    // emit namespace binding events
    var tag = parser.tag

    // add namespace info to tag
    var qn = qname(parser.tagName)
    tag.prefix = qn.prefix
    tag.local = qn.local
    tag.uri = tag.ns[qn.prefix] || qn.prefix

    if (tag.prefix && !tag.uri) {
      strictFail(parser, "Unbound namespace prefix: "
                       + JSON.stringify(parser.tagName))
    }

    var parent = parser.tags[parser.tags.length - 1] || parser
    if (tag.ns && parent.ns !== tag.ns) {
      Object.keys(tag.ns).forEach(function (p) {
        emitNode( parser
                , "onopennamespace"
                , { prefix: p , uri: tag.ns[p] } )
      })
    }

    // handle deferred onattribute events
    for (var i = 0, l = parser.attribList.length; i < l; i ++) {
      var nv = parser.attribList[i]
      var name = nv[0]
        , value = nv[1]
        , qualName = qname(name)
        , prefix = qualName.prefix
        , local = qualName.local
        , uri = tag.ns[prefix] || ""
        , a = { name: name
              , value: value
              , prefix: prefix
              , local: local
              , uri: uri
              }

      // if there's any attributes with an undefined namespace,
      // then fail on them now.
      if (prefix && prefix != "xmlns" && !uri) {
        strictFail(parser, "Unbound namespace prefix: "
                         + JSON.stringify(prefix))
        a.uri = prefix
      }
      parser.tag.attributes[name] = a
      emitNode(parser, "onattribute", a)
    }
    parser.attribList.length = 0
  }

  // process the tag
  parser.sawRoot = true
  parser.tags.push(parser.tag)
  emitNode(parser, "onopentag", parser.tag)
  if (!selfClosing) {
    // special case for <script> in non-strict mode.
    if (!parser.noscript && parser.tagName.toLowerCase() === "script") {
      parser.state = S.SCRIPT
    } else {
      parser.state = S.TEXT
    }
    parser.tag = null
    parser.tagName = ""
  }
  parser.attribName = parser.attribValue = ""
  parser.attribList.length = 0
}

function closeTag (parser) {
  if (!parser.tagName) {
    strictFail(parser, "Weird empty close tag.")
    parser.textNode += "</>"
    parser.state = S.TEXT
    return
  }
  // first make sure that the closing tag actually exists.
  // <a><b></c></b></a> will close everything, otherwise.
  var t = parser.tags.length
  var tagName = parser.tagName
  if (!parser.strict) tagName = tagName[parser.tagCase]()
  var closeTo = tagName
  while (t --) {
    var close = parser.tags[t]
    if (close.name !== closeTo) {
      // fail the first time in strict mode
      strictFail(parser, "Unexpected close tag")
    } else break
  }

  // didn't find it.  we already failed for strict, so just abort.
  if (t < 0) {
    strictFail(parser, "Unmatched closing tag: "+parser.tagName)
    parser.textNode += "</" + parser.tagName + ">"
    parser.state = S.TEXT
    return
  }
  parser.tagName = tagName
  var s = parser.tags.length
  while (s --> t) {
    var tag = parser.tag = parser.tags.pop()
    parser.tagName = parser.tag.name
    emitNode(parser, "onclosetag", parser.tagName)

    var x = {}
    for (var i in tag.ns) x[i] = tag.ns[i]

    var parent = parser.tags[parser.tags.length - 1] || parser
    if (parser.opt.xmlns && tag.ns !== parent.ns) {
      // remove namespace bindings introduced by tag
      Object.keys(tag.ns).forEach(function (p) {
        var n = tag.ns[p]
        emitNode(parser, "onclosenamespace", { prefix: p, uri: n })
      })
    }
  }
  if (t === 0) parser.closedRoot = true
  parser.tagName = parser.attribValue = parser.attribName = ""
  parser.attribList.length = 0
  parser.state = S.TEXT
}

function parseEntity (parser) {
  var entity = parser.entity.toLowerCase()
    , num
    , numStr = ""
  if (parser.ENTITIES[entity]) return parser.ENTITIES[entity]
  if (entity.charAt(0) === "#") {
    if (entity.charAt(1) === "x") {
      entity = entity.slice(2)
      num = parseInt(entity, 16)
      numStr = num.toString(16)
    } else {
      entity = entity.slice(1)
      num = parseInt(entity, 10)
      numStr = num.toString(10)
    }
  }
  entity = entity.replace(/^0+/, "")
  if (numStr.toLowerCase() !== entity) {
    strictFail(parser, "Invalid character entity")
    return "&"+parser.entity + ";"
  }
  return String.fromCharCode(num)
}

function write (chunk) {
  var parser = this
  if (this.error) throw this.error
  if (parser.closed) return error(parser,
    "Cannot write after close. Assign an onready handler.")
  if (chunk === null) return end(parser)
  var i = 0, c = ""
  while (parser.c = c = chunk.charAt(i++)) {
    parser.position ++
    if (c === "\n") {
      parser.line ++
      parser.column = 0
    } else parser.column ++
    switch (parser.state) {

      case S.BEGIN:
        if (c === "<") parser.state = S.OPEN_WAKA
        else if (not(whitespace,c)) {
          // have to process this as a text node.
          // weird, but happens.
          strictFail(parser, "Non-whitespace before first tag.")
          parser.textNode = c
          parser.state = S.TEXT
        }
      continue

      case S.TEXT:
        if (parser.sawRoot && !parser.closedRoot) {
          var starti = i-1
          while (c && c!=="<" && c!=="&") {
            c = chunk.charAt(i++)
            if (c) {
              parser.position ++
              if (c === "\n") {
                parser.line ++
                parser.column = 0
              } else parser.column ++
            }
          }
          parser.textNode += chunk.substring(starti, i-1)
        }
        if (c === "<") parser.state = S.OPEN_WAKA
        else {
          if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot))
            strictFail("Text data outside of root node.")
          if (c === "&") parser.state = S.TEXT_ENTITY
          else parser.textNode += c
        }
      continue

      case S.SCRIPT:
        // only non-strict
        if (c === "<") {
          parser.state = S.SCRIPT_ENDING
        } else parser.script += c
      continue

      case S.SCRIPT_ENDING:
        if (c === "/") {
          emitNode(parser, "onscript", parser.script)
          parser.state = S.CLOSE_TAG
          parser.script = ""
          parser.tagName = ""
        } else {
          parser.script += "<" + c
          parser.state = S.SCRIPT
        }
      continue

      case S.OPEN_WAKA:
        // either a /, ?, !, or text is coming next.
        if (c === "!") {
          parser.state = S.SGML_DECL
          parser.sgmlDecl = ""
        } else if (is(whitespace, c)) {
          // wait for it...
        } else if (is(nameStart,c)) {
          parser.startTagPosition = parser.position - 1
          parser.state = S.OPEN_TAG
          parser.tagName = c
        } else if (c === "/") {
          parser.startTagPosition = parser.position - 1
          parser.state = S.CLOSE_TAG
          parser.tagName = ""
        } else if (c === "?") {
          parser.state = S.PROC_INST
          parser.procInstName = parser.procInstBody = ""
        } else {
          strictFail(parser, "Unencoded <")
          parser.textNode += "<" + c
          parser.state = S.TEXT
        }
      continue

      case S.SGML_DECL:
        if ((parser.sgmlDecl+c).toUpperCase() === CDATA) {
          emitNode(parser, "onopencdata")
          parser.state = S.CDATA
          parser.sgmlDecl = ""
          parser.cdata = ""
        } else if (parser.sgmlDecl+c === "--") {
          parser.state = S.COMMENT
          parser.comment = ""
          parser.sgmlDecl = ""
        } else if ((parser.sgmlDecl+c).toUpperCase() === DOCTYPE) {
          parser.state = S.DOCTYPE
          if (parser.doctype || parser.sawRoot) strictFail(parser,
            "Inappropriately located doctype declaration")
          parser.doctype = ""
          parser.sgmlDecl = ""
        } else if (c === ">") {
          emitNode(parser, "onsgmldeclaration", parser.sgmlDecl)
          parser.sgmlDecl = ""
          parser.state = S.TEXT
        } else if (is(quote, c)) {
          parser.state = S.SGML_DECL_QUOTED
          parser.sgmlDecl += c
        } else parser.sgmlDecl += c
      continue

      case S.SGML_DECL_QUOTED:
        if (c === parser.q) {
          parser.state = S.SGML_DECL
          parser.q = ""
        }
        parser.sgmlDecl += c
      continue

      case S.DOCTYPE:
        if (c === ">") {
          parser.state = S.TEXT
          emitNode(parser, "ondoctype", parser.doctype)
          parser.doctype = true // just remember that we saw it.
        } else {
          parser.doctype += c
          if (c === "[") parser.state = S.DOCTYPE_DTD
          else if (is(quote, c)) {
            parser.state = S.DOCTYPE_QUOTED
            parser.q = c
          }
        }
      continue

      case S.DOCTYPE_QUOTED:
        parser.doctype += c
        if (c === parser.q) {
          parser.q = ""
          parser.state = S.DOCTYPE
        }
      continue

      case S.DOCTYPE_DTD:
        parser.doctype += c
        if (c === "]") parser.state = S.DOCTYPE
        else if (is(quote,c)) {
          parser.state = S.DOCTYPE_DTD_QUOTED
          parser.q = c
        }
      continue

      case S.DOCTYPE_DTD_QUOTED:
        parser.doctype += c
        if (c === parser.q) {
          parser.state = S.DOCTYPE_DTD
          parser.q = ""
        }
      continue

      case S.COMMENT:
        if (c === "-") parser.state = S.COMMENT_ENDING
        else parser.comment += c
      continue

      case S.COMMENT_ENDING:
        if (c === "-") {
          parser.state = S.COMMENT_ENDED
          parser.comment = textopts(parser.opt, parser.comment)
          if (parser.comment) emitNode(parser, "oncomment", parser.comment)
          parser.comment = ""
        } else {
          parser.comment += "-" + c
          parser.state = S.COMMENT
        }
      continue

      case S.COMMENT_ENDED:
        if (c !== ">") {
          strictFail(parser, "Malformed comment")
          // allow <!-- blah -- bloo --> in non-strict mode,
          // which is a comment of " blah -- bloo "
          parser.comment += "--" + c
          parser.state = S.COMMENT
        } else parser.state = S.TEXT
      continue

      case S.CDATA:
        if (c === "]") parser.state = S.CDATA_ENDING
        else parser.cdata += c
      continue

      case S.CDATA_ENDING:
        if (c === "]") parser.state = S.CDATA_ENDING_2
        else {
          parser.cdata += "]" + c
          parser.state = S.CDATA
        }
      continue

      case S.CDATA_ENDING_2:
        if (c === ">") {
          if (parser.cdata) emitNode(parser, "oncdata", parser.cdata)
          emitNode(parser, "onclosecdata")
          parser.cdata = ""
          parser.state = S.TEXT
        } else if (c === "]") {
          parser.cdata += "]"
        } else {
          parser.cdata += "]]" + c
          parser.state = S.CDATA
        }
      continue

      case S.PROC_INST:
        if (c === "?") parser.state = S.PROC_INST_ENDING
        else if (is(whitespace, c)) parser.state = S.PROC_INST_BODY
        else parser.procInstName += c
      continue

      case S.PROC_INST_BODY:
        if (!parser.procInstBody && is(whitespace, c)) continue
        else if (c === "?") parser.state = S.PROC_INST_ENDING
        else if (is(quote, c)) {
          parser.state = S.PROC_INST_QUOTED
          parser.q = c
          parser.procInstBody += c
        } else parser.procInstBody += c
      continue

      case S.PROC_INST_ENDING:
        if (c === ">") {
          emitNode(parser, "onprocessinginstruction", {
            name : parser.procInstName,
            body : parser.procInstBody
          })
          parser.procInstName = parser.procInstBody = ""
          parser.state = S.TEXT
        } else {
          parser.procInstBody += "?" + c
          parser.state = S.PROC_INST_BODY
        }
      continue

      case S.PROC_INST_QUOTED:
        parser.procInstBody += c
        if (c === parser.q) {
          parser.state = S.PROC_INST_BODY
          parser.q = ""
        }
      continue

      case S.OPEN_TAG:
        if (is(nameBody, c)) parser.tagName += c
        else {
          newTag(parser)
          if (c === ">") openTag(parser)
          else if (c === "/") parser.state = S.OPEN_TAG_SLASH
          else {
            if (not(whitespace, c)) strictFail(
              parser, "Invalid character in tag name")
            parser.state = S.ATTRIB
          }
        }
      continue

      case S.OPEN_TAG_SLASH:
        if (c === ">") {
          openTag(parser, true)
          closeTag(parser)
        } else {
          strictFail(parser, "Forward-slash in opening tag not followed by >")
          parser.state = S.ATTRIB
        }
      continue

      case S.ATTRIB:
        // haven't read the attribute name yet.
        if (is(whitespace, c)) continue
        else if (c === ">") openTag(parser)
        else if (c === "/") parser.state = S.OPEN_TAG_SLASH
        else if (is(nameStart, c)) {
          parser.attribName = c
          parser.attribValue = ""
          parser.state = S.ATTRIB_NAME
        } else strictFail(parser, "Invalid attribute name")
      continue

      case S.ATTRIB_NAME:
        if (c === "=") parser.state = S.ATTRIB_VALUE
        else if (is(whitespace, c)) parser.state = S.ATTRIB_NAME_SAW_WHITE
        else if (is(nameBody, c)) parser.attribName += c
        else strictFail(parser, "Invalid attribute name")
      continue

      case S.ATTRIB_NAME_SAW_WHITE:
        if (c === "=") parser.state = S.ATTRIB_VALUE
        else if (is(whitespace, c)) continue
        else {
          strictFail(parser, "Attribute without value")
          parser.tag.attributes[parser.attribName] = ""
          parser.attribValue = ""
          emitNode(parser, "onattribute",
                   { name : parser.attribName, value : "" })
          parser.attribName = ""
          if (c === ">") openTag(parser)
          else if (is(nameStart, c)) {
            parser.attribName = c
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, "Invalid attribute name")
            parser.state = S.ATTRIB
          }
        }
      continue

      case S.ATTRIB_VALUE:
        if (is(whitespace, c)) continue
        else if (is(quote, c)) {
          parser.q = c
          parser.state = S.ATTRIB_VALUE_QUOTED
        } else {
          strictFail(parser, "Unquoted attribute value")
          parser.state = S.ATTRIB_VALUE_UNQUOTED
          parser.attribValue = c
        }
      continue

      case S.ATTRIB_VALUE_QUOTED:
        if (c !== parser.q) {
          if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_Q
          else parser.attribValue += c
          continue
        }
        attrib(parser)
        parser.q = ""
        parser.state = S.ATTRIB
      continue

      case S.ATTRIB_VALUE_UNQUOTED:
        if (not(attribEnd,c)) {
          if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_U
          else parser.attribValue += c
          continue
        }
        attrib(parser)
        if (c === ">") openTag(parser)
        else parser.state = S.ATTRIB
      continue

      case S.CLOSE_TAG:
        if (!parser.tagName) {
          if (is(whitespace, c)) continue
          else if (not(nameStart, c)) strictFail(parser,
            "Invalid tagname in closing tag.")
          else parser.tagName = c
        }
        else if (c === ">") closeTag(parser)
        else if (is(nameBody, c)) parser.tagName += c
        else {
          if (not(whitespace, c)) strictFail(parser,
            "Invalid tagname in closing tag")
          parser.state = S.CLOSE_TAG_SAW_WHITE
        }
      continue

      case S.CLOSE_TAG_SAW_WHITE:
        if (is(whitespace, c)) continue
        if (c === ">") closeTag(parser)
        else strictFail("Invalid characters in closing tag")
      continue

      case S.TEXT_ENTITY:
      case S.ATTRIB_VALUE_ENTITY_Q:
      case S.ATTRIB_VALUE_ENTITY_U:
        switch(parser.state) {
          case S.TEXT_ENTITY:
            var returnState = S.TEXT, buffer = "textNode"
          break

          case S.ATTRIB_VALUE_ENTITY_Q:
            var returnState = S.ATTRIB_VALUE_QUOTED, buffer = "attribValue"
          break

          case S.ATTRIB_VALUE_ENTITY_U:
            var returnState = S.ATTRIB_VALUE_UNQUOTED, buffer = "attribValue"
          break
        }
        if (c === ";") {
          parser[buffer] += parseEntity(parser)
          parser.entity = ""
          parser.state = returnState
        }
        else if (is(entity, c)) parser.entity += c
        else {
          strictFail("Invalid character entity")
          parser[buffer] += "&" + parser.entity + c
          parser.entity = ""
          parser.state = returnState
        }
      continue

      default:
        throw new Error(parser, "Unknown state: " + parser.state)
    }
  } // while
  // cdata blocks can get very big under normal conditions. emit and move on.
  // if (parser.state === S.CDATA && parser.cdata) {
  //   emitNode(parser, "oncdata", parser.cdata)
  //   parser.cdata = ""
  // }
  if (parser.position >= parser.bufferCheckPosition) checkBufferLength(parser)
  return parser
}

})(typeof exports === "undefined" ? sax = {} : exports);
(function(w){
	
function handleMeta (node, type) {
  if (!type || !node) return {};

  var meta = {};
  ['title','description','date','pubDate','link','xmlUrl','author','language','favicon','copyright','generator'].forEach(function (property){
    meta[property] = null;
  });
  meta.image = {};
  meta.categories = [];

  Object.keys(node).forEach(function(name){
    var el = node[name];
    switch(name){
    case('title'):
      meta.title = getValue(el);
      break;
    case('description'):
    case('subtitle'):
      meta.description = getValue(el);
      break;
    case('pubdate'):
    case('lastbuilddate'):
    case('published'):
    case('modified'):
    case('updated'):
    case('dc:date'):
      var date = getValue(el) ? new Date(el['#']) : null;
      if (!date) break;
      if (meta.pubDate === null || name == 'pubdate' || name == 'published')
        meta.pubDate = date;
      if (meta.date === null || name == 'lastbuilddate' || name == 'modified' || name == 'updated')
        meta.date = date;
      break;
    case('link'):
    case('atom:link'):
    case('atom10:link'):
      if (Array.isArray(el)) {
        el.forEach(function (link){
          if (link['@']['href']) { // Atom
            if (getValue(link['@'], 'rel')) {
              if (link['@']['rel'] == 'alternate') meta.link = link['@']['href'];
              else if (link['@']['rel'] == 'self') meta.xmlUrl = link['@']['href'];
            } else {
              meta.link = link['@']['href'];
            }
          } else if (Object.keys(link['@']).length === 0) { // RSS
            if (!meta.link) meta.link = getValue(link);
          }
        });
      } else {
        if (el['@']['href']) { // Atom
          if (getValue(el['@'], 'rel')) {
            if (el['@']['rel'] == 'alternate') meta.link = el['@']['href'];
            else if (el['@']['rel'] == 'self') meta.xmlUrl = el['@']['href'];
          } else {
            meta.link = el['@']['href'];
          }
        } else if (Object.keys(el['@']).length === 0) { // RSS
          if (!meta.link) meta.link = getValue(el);
        }
      }
      break;
    case('managingeditor'):
    case('webmaster'):
    case('author'):
      if (meta.author === null || name == 'managingeditor')
        meta.author = getValue(el);
      if (name == 'author')
        meta.author = getValue(el.name) || getValue(el.email) || getValue(el.uri);
      break;
    case('language'):
      meta.language = getValue(el);
      break;
    case('image'):
    case('logo'):
      if (el.url)
        meta.image.url = getValue(el.url);
      if (el.title)
        meta.image.title = getValue(el.title);
      else meta.image.url = getValue(el);
      break;
    case('icon'):
      meta.favicon = getValue(el);
      break;
    case('copyright'):
    case('rights'):
    case('dc:rights'):
      meta.copyright = getValue(el);
      break;
    case('generator'):
      meta.generator = getValue(el);
      if (el['@'].version)
        meta.generator += (meta.generator ? ' ' : '') + 'v' + el['@'].version;
      if (el['@'].uri)
        meta.generator += meta.generator ? ' (' + el['@'].uri + ')' : el['@'].uri;
      break;
    case('category'):
    case('dc:subject'):
    case('itunes:category'):
    case('media:category'):
      /* We handle all the kinds of categories within the switch loop because meta.categories
       * is an array, unlike the other properties, and therefore can handle multiple values
       */
      if (Array.isArray(el)) {
        el.forEach(function (category){
          if ('category' == name && 'atom' == type) {
            if (category['@'] && getValue(category['@'], 'term')) meta.categories.push(getValue(category['@'], 'term'));
          } else if ('category' == name && getValue(category) && 'rss' == type) {
            var categories = getValue(category).split(',').map(function (cat){ return cat.trim(); });
            if (categories.length) meta.categories = meta.categories.concat(categories);
          } else if ('dc:subject' == name && getValue(category)) {
            var categories = getValue(category).split(' ').map(function (cat){ return cat.trim(); });
            if (categories.length) meta.categories = meta.categories.concat(categories);
          } else if ('itunes:category' == name) {
            var cat;
            if (category['@'] && getValue(category['@'], 'text')) cat = getValue(category['@'], 'text');
            if (category[name]) {
              if (Array.isArray(category[name])) {
                category[name].forEach(function (subcategory){
                  if (subcategory['@'] && getValue(subcategory['@'], 'text')) meta.categories.push(cat + '/' + getValue(subcategory['@'], 'text'));
                });
              } else {
                if (category[name]['@'] && getValue(category[name]['@'], 'text'))
                  meta.categories.push(cat + '/' + getValue(category[name]['@'], 'text'));
              }
            } else {
              meta.categories.push(cat);
            }
          } else if ('media:category' == name) {
            meta.categories.push(getValue(category));
          }
        });
      } else {
        if ('category' == name && 'atom' == type) {
          if (getValue(el['@'], 'term')) meta.categories.push(getValue(el['@'], 'term'));
        } else if ('category' == name && getValue(el) && 'rss' == type) {
          var categories = getValue(el).split(',').map(function (cat){ return cat.trim(); });
          if (categories.length) meta.categories = meta.categories.concat(categories);
        } else if ('dc:subject' == name && getValue(el)) {
          var categories = getValue(el).split(' ').map(function (cat){ return cat.trim(); });
          if (categories.length) meta.categories = meta.categories.concat(categories);
        } else if ('itunes:category' == name) {
          var cat;
          if (el['@'] && getValue(el['@'], 'text')) cat = getValue(el['@'], 'text');
          if (el[name]) {
            if (Array.isArray(el[name])) {
              el[name].forEach(function (subcategory){
                if (subcategory['@'] && getValue(subcategory['@'], 'text')) meta.categories.push(cat + '/' + getValue(subcategory['@'], 'text'));
              });
            } else {
              if (el[name]['@'] && getValue(el[name]['@'], 'text'))
                meta.categories.push(cat + '/' + getValue(el[name]['@'], 'text'));
            }
          } else {
            meta.categories.push(cat);
          }
        } else if ('media:category' == name) {
          meta.categories.push(getValue(el));
        }
      }
      break;
    } // switch end
    // Fill with all native other namespaced properties
    if (name.indexOf('#') !== 0) {
      if (~name.indexOf(':')) meta[name] = el;
      else meta[type + ':' + name] = el;
    }
  }); // forEach end
  if (!meta.description) {
    if (node['itunes:summary']) meta.description = getValue(node['itunes:summary']);
    else if (node['tagline']) meta.description = getValue(node['tagline']);
  }
  if (!meta.author) {
    if (node['itunes:author']) meta.author = getValue(node['itunes:author']);
    else if (node['itunes:owner'] && node['itunes:owner']['itunes:name']) meta.author = getValue(node['itunes:owner']['itunes:name']);
    else if (node['dc:creator']) meta.author = getValue(node['dc:creator']);
    else if (node['dc:publisher']) meta.author = getValue(node['dc:publisher']);
  }
  if (!meta.language) {
    if (node['@']['xml:lang']) meta.language = getValue(node['@'], 'xml:lang');
    else if (node['dc:language']) meta.language = getValue(node['dc:language']);
  }
  if (!meta.image.url) {
    if (node['itunes:image']) meta.image.url = getValue(node['itunes:image']['@'], 'href');
    else if (node['media:thumbnail']) meta.image.url = getValue(node['media:thumbnail']['@'], 'url');
  }
  if (!meta.copyright) {
    if (node['media:copyright']) meta.copyright = getValue(node['media:copyright']);
    else if (node['dc:rights']) meta.copyright = getValue(node['dc:rights']);
    else if (node['creativecommons:license']) meta.copyright = getValue(node['creativecommons:license']);
    else if (node['cc:license'] && node['cc:license']['@']['rdf:resource']) meta.copyright = getValue(node['cc:license']['@'], 'rdf:resource');
  }
  if (!meta.generator) {
    if (node['admin:generatoragent'] && node['admin:generatoragent']['@']['rdf:resource']) meta.generator = getValue(node['admin:generatoragent']['@'], 'rdf:resource');
  }
  if (meta.categories.length)
    meta.categories = Array.unique(meta.categories);
  return meta;
}

function handleItem (node, type){
  if (!type || !node) return {};

  var item = {};
  ['title','description','summary','date','pubDate','link','guid','author','comments', 'origlink'].forEach(function (property){
    item[property] = null;
  });
  item.image = {};
  item.source = {};
  item.categories = [];
  item.enclosures = [];

  Object.keys(node).forEach(function(name){
    var el = node[name];
    switch(name){
    case('title'):
      item.title = getValue(el);
      break;
    case('description'):
    case('summary'):
      item.summary = getValue(el);
      if (!item.description) item.description = getValue(el);
      break;
    case('content'):
    case('content:encoded'):
      item.description = getValue(el);
      break;
    case('pubdate'):
    case('published'):
    case('issued'):
    case('modified'):
    case('updated'):
    case('dc:date'):
      var date = getValue(el) ? new Date(el['#']) : null;
      if (!date) break;
      if (item.pubDate === null || name == 'pubdate' || name == 'published' || name == 'issued')
        item.pubDate = date;
      if (item.date === null || name == 'modified' || name == 'updated')
        item.date = date;
      break;
    case('link'):
      if (Array.isArray(el)) {
        el.forEach(function (link){
          if (link['@']['href']) { // Atom
            if (getValue(link['@'], 'rel')) {
              if (link['@']['rel'] == 'alternate') item.link = link['@']['href'];
              if (link['@']['rel'] == 'replies') item.comments = link['@']['href'];
              if (link['@']['rel'] == 'enclosure') {
                var enclosure = {};
                enclosure.url = link['@']['href'];
                enclosure.type = getValue(link['@'], 'type');
                enclosure.length = getValue(link['@'], 'length');
                item.enclosures.push(enclosure);
              }
            } else {
              item.link = link['@']['href'];
            }
          } else if (Object.keys(link['@']).length === 0) { // RSS
            if (!item.link) item.link = getValue(link);
          }
        });
      } else {
        if (el['@']['href']) { // Atom
          if (getValue(el['@'], 'rel')) {
            if (el['@']['rel'] == 'alternate') item.link = el['@']['href'];
            if (el['@']['rel'] == 'replies') item.comments = el['@']['href'];
            if (el['@']['rel'] == 'enclosure') {
              var enclosure = {};
              enclosure.url = el['@']['href'];
              enclosure.type = getValue(el['@'], 'type');
              enclosure.length = getValue(el['@'], 'length');
              item.enclosures.push(enclosure);
            }
          } else {
            item.link = el['@']['href'];
          }
        } else if (Object.keys(el['@']).length === 0) { // RSS
          if (!item.link) item.link = getValue(el);
        }
      }
      if (!item.guid) item.guid = item.link;
      break;
    case('guid'):
    case('id'):
      item.guid = getValue(el);
      break;
    case('author'):
      item.author = getValue(el.name) || getValue(el.email) || getValue(el.uri);
      break;
    case('dc:creator'):
      item.author = getValue(el);
      break;
    case('comments'):
      item.comments = getValue(el);
      break;
    case('source'):
      if ('rss' == type) {
        item.source['title'] = getValue(el);
        item.source['url'] = getValue(el['@'], 'url');
      } else if ('atom' == type) {
        if (el.title && getValue(el.title))
          item.source['title'] = getValue(el.title);
        if (el.link && getValue(el.link['@'], 'href'))
        item.source['url'] = getValue(el.link['@'], 'href');
      }
      break;
    case('enclosure'):
    case('media:content'):
      if (Array.isArray(el)) {
        el.forEach(function (enc){
          var enclosure = {};
          enclosure.url = getValue(enc['@'], 'url');
          enclosure.type = getValue(enc['@'], 'type') || getValue(enc['@'], 'medium');
          enclosure.length = getValue(enc['@'], 'length') || getValue(enc['@'], 'filesize');
          item.enclosures.push(enclosure);
        });
      } else {
        var enclosure = {};
        enclosure.url = getValue(el['@'], 'url');
        enclosure.type = getValue(el['@'], 'type') || getValue(el['@'], 'medium');
        enclosure.length = getValue(el['@'], 'length') || getValue(el['@'], 'filesize');
        item.enclosures.push(enclosure);
      }
      break;
    case('enc:enclosure'): // Can't find this in use for an example to debug. Only example found does not comply with the spec -- can't code THAT!
      break;      
    case('category'):
    case('dc:subject'):
    case('itunes:category'):
    case('media:category'):
      /* We handle all the kinds of categories within the switch loop because item.categories
       * is an array, unlike the other properties, and therefore can handle multiple values
       */
      if (Array.isArray(el)) {
        el.forEach(function (category){
          if ('category' == name && 'atom' == type) {
            if (category['@'] && getValue(category['@'], 'term')) item.categories.push(getValue(category['@'], 'term'));
          } else if ('category' == name && getValue(category) && 'rss' == type) {
            var categories = getValue(category).split(',').map(function (cat){ return cat.trim(); });
            if (categories.length) item.categories = item.categories.concat(categories);
          } else if ('dc:subject' == name && getValue(category)) {
            var categories = getValue(category).split(' ').map(function (cat){ return cat.trim(); });
            if (categories.length) item.categories = item.categories.concat(categories);
          } else if ('itunes:category' == name) {
            var cat;
            if (category['@'] && getValue(category['@'], 'text')) cat = getValue(category['@'], 'text');
            if (category[name]) {
              if (Array.isArray(category[name])) {
                category[name].forEach(function (subcategory){
                  if (subcategory['@'] && getValue(subcategory['@'], 'text')) item.categories.push(cat + '/' + getValue(subcategory['@'], 'text'));
                });
              } else {
                if (category[name]['@'] && getValue(category[name]['@'], 'text'))
                  item.categories.push(cat + '/' + getValue(category[name]['@'], 'text'));
              }
            } else {
              item.categories.push(cat);
            }
          } else if ('media:category' == name) {
            item.categories.push(getValue(category));
          }
        });
      } else {
        if ('category' == name && 'atom' == type) {
          if (getValue(el['@'], 'term')) item.categories.push(getValue(el['@'], 'term'));
        } else if ('category' == name && getValue(el) && 'rss' == type) {
          var categories = getValue(el).split(',').map(function (cat){ return cat.trim(); });
          if (categories.length) item.categories = item.categories.concat(categories);
        } else if ('dc:subject' == name && getValue(el)) {
          var categories = getValue(el).split(' ').map(function (cat){ return cat.trim(); });
          if (categories.length) item.categories = item.categories.concat(categories);
        } else if ('itunes:category' == name) {
          var cat;
          if (el['@'] && getValue(el['@'], 'text')) cat = getValue(el['@'], 'text');
          if (el[name]) {
            if (Array.isArray(el[name])) {
              el[name].forEach(function (subcategory){
                if (subcategory['@'] && getValue(subcategory['@'], 'text')) item.categories.push(cat + '/' + getValue(subcategory['@'], 'text'));
              });
            } else {
              if (el[name]['@'] && getValue(el[name]['@'], 'text'))
                item.categories.push(cat + '/' + getValue(el[name]['@'], 'text'));
            }
          } else {
            item.categories.push(cat);
          }
        } else if ('media:category' == name) {
          item.categories.push(getValue(el));
        }
      }
      break;
    case('feedburner:origlink'):
    case('pheedo:origlink'):
      item.origlink = getValue(el);
      break;
    } // switch end
    // Fill with all native other namespaced properties
    if (name.indexOf('#') !== 0) {
      if (~name.indexOf(':')) item[name] = el;
      else item[type + ':' + name] = el;
    }
  }); // forEach end
  if (!item.description) {
    if (node['itunes:summary']) item.description = getValue(node['itunes:summary']);
  }
  if (!item.author) {
    if (node['itunes:author']) item.author = getValue(node['itunes:author']);
    else if (node['itunes:owner'] && node['itunes:owner']['itunes:name']) item.author = getValue(node['itunes:owner']['itunes:name']);
    else if (node['dc:publisher']) item.author = getValue(node['dc:publisher']);
  }
  if (!item.image.url) {
    if (node['itunes:image']) item.image.url = getValue(node['itunes:image']['@'], 'href');
    else if (node['media:thumbnail']) item.image.url = getValue(node['media:thumbnail']['@'], 'url');
    else if (node['media:content'] && node['media:content']['media:thumbnail']) item.image.url = getValue(node['media:content']['media:thumbnail']['@'], 'url');
    else if (node['media:group'] && node['media:group']['media:thumbnail']) item.image.url = getValue(node['media:group']['media:thumbnail']['@'], 'url');
    else if (node['media:group'] && node['media:group']['media:content'] && node['media:group']['media:content']['media:thumbnail']) item.image.url = getValue(node['media:group']['media:content']['media:thumbnail']['@'], 'url');
  }
  if (item.categories.length)
    item.categories = Array.unique(item.categories);
  return item;
}

/**
 * FeedParser constructor. Most apps will only use one instance.
 *
 * @api public
 */
function FeedParser () {
  var self = this;
  self.saxStream = sax.parser(true); // https://github.com/isaacs/sax-js
  self.saxStream.onerror = function (e){ self.handleError(e, self) };
  self.saxStream.onopentag =  function (n){ self.handleOpenTag(n, self)};
  self.saxStream.onclosetag =  function (el){ self.handleCloseTag(el, self)};
  self.saxStream.ontext =  function (text){ self.handleText(text, self)};
  self.saxStream.oncdata =  function (text){ self.handleText(text, self)};
  self.saxStream.onend =  function (){ self.handleEnd(self) };
}

/**
 * Parses a feed contained in a string.
 *
 * For each article/post in a feed, emits an 'article' event 
 * with an object with the following keys:
 *   title {String}
 *   description {String}
 *   summary {String}
 *   date {Date} (or null)
 *   pubDate {Date} (or null)
 *   link {String}
 *   origlink {String}
 *   author {String}
 *   guid {String}
 *   comments {String}
 *   image {Object}
 *   categories {Array}
 *   source {Object}
 *   enclosures {Array}
 *   meta {Object}
 *   Object.keys(meta):
 *     #ns {Array} key,value pairs of each namespace declared for the feed
 *     #type {String} one of 'atom', 'rss', 'rdf'
 *     #version {String}
 *     title {String}
 *     description {String}
 *     date {Date} (or null)
 *     pubDate {Date} (or null)
 *     link {String} i.e., to the website, not the feed
 *     xmlUrl {String} the canonical URL of the feed, as declared by the feed
 *     author {String}
 *     language {String}
 *     image {Object}
 *     favicon {String}
 *     copyright {String}
 *     generator {String}
 *     categories {Array}
 *
 * Emits a 'warning' event on each XML parser warning
 *
 * Emits an 'error' event on each XML parser error
 *
 * @param {String} string of XML representing the feed
 * @param {Function} callback
 * @api public
 */

FeedParser.prototype.parseString = function(string, callback) {
  var self = this;
  self._reset(callback);
  self.saxStream.write(string).close();
};


FeedParser.prototype.handleEnd = function (scope){
  var self = scope;
  var meta = self.meta
    , articles = self.articles;


  if ('function' == typeof self.callback) {
    if (self.errors.length) {
      var error = self.errors.pop();
      if (self.errors.length) {
        error.errors = self.errors;
      }
      self.callback(error);
    } else {
      self.callback(null, meta, articles);
    }
  }
  
};

FeedParser.prototype.handleError = function (e, scope){
  var self = scope;

  self.errors.push(e);
  self._parser.error = null;
  self._parser.resume();
};

FeedParser.prototype.handleOpenTag = function (node, scope){
  var self = scope;
  var n = {};
  n['#name'] = node.name; // Avoid namespace collissions later...
  n['@'] = {};
  n['#'] = '';

  function handleAttributes (attrs, el) {
    Object.keys(attrs).forEach(function(name){
      if (self.xmlbase.length && (name == 'href' || name == 'src' || name == 'uri')) {
        // Apply xml:base to these elements as they appear
        // rather than leaving it to the ultimate parser
        attrs[name] = self.xmlbase[0]['#'];
      } else if (name == 'xml:base') {
        if (self.xmlbase.length) {
          attrs[name] = self.xmlbase[0]['#'];
        }
        self.xmlbase.unshift({ '#name': el, '#': attrs[name]});
      } else if (name == 'type' && attrs['type'] == 'xhtml') {
        self.in_xhtml = true;
        self.xhtml = {'#name': el, '#': ''};
      }
      attrs[name] = attrs[name].trim();
    });
    return attrs;
  };

  if (Object.keys(node.attributes).length) {
    n['@'] = handleAttributes(node.attributes, n['#name']);
  }

  if (self.in_xhtml && self.xhtml['#name'] != n['#name']) { // We are in an xhtml node
    // This builds the opening tag, e.g., <div id='foo' class='bar'>
    self.xhtml['#'] += '<'+n['#name'];
    Object.keys(n['@']).forEach(function(name){
      self.xhtml['#'] += ' '+ name +'="'+ n['@'][name] + '"';
    });
    self.xhtml['#'] += '>';
  } else if (self.stack.length == 0 && 
            (n['#name'] == 'rss' || n['#name'] == 'rdf:rdf' || n['#name'] == 'feed')) {
    self.meta['#ns'] = [];
    Object.keys(n['@']).forEach(function(name) {
      if (name.indexOf('xmlns') == 0) {
        var o = new Object;
        o[name] = n['@'][name];
        self.meta['#ns'].push(o);
      }
    });
    switch(n['#name']) {
    case 'rss':
      self.meta['#type'] = 'rss';
      self.meta['#version'] = n['@']['version'];
      break;
    case 'rdf:rdf':
      self.meta['#type'] = 'rdf';
      self.meta['#version'] = n['@']['version'] || '1.0';
      break;
    case 'feed':
      self.meta['#type'] = 'atom';
      self.meta['#version'] = n['@']['version'] || '1.0';
      break;
    }
  }
  self.stack.unshift(n);
};

FeedParser.prototype.handleCloseTag = function (el, scope){
  var self = scope;
  var n = self.stack.shift();
  delete n['#name'];

  if (self.xmlbase.length && (el == 'logo' || el == 'icon')) { // Via atom
    // Apply xml:base to these elements as they appear
    // rather than leaving it to the ultimate parser
    n['#'] = self.xmlbase[0]['#'];
  }

  if (self.xmlbase.length && (el == self.xmlbase[0]['#name'])) {
    void self.xmlbase.shift();
  }

  if (self.in_xhtml) {
    if (el == self.xhtml['#name']) { // The end of the XHTML

      // Add xhtml data to the container element
      n['#'] += self.xhtml['#'].trim();
        // Clear xhtml nodes from the tree
        for (var key in n) {
          if (key != '@' && key != '#') {
            delete n[key];
          }
        }
      self.xhtml = {};
      self.in_xhtml = false;
    } else { // Somewhere in the middle of the XHTML
      self.xhtml['#'] += '</' + el + '>';
    }
  }

  if ('#' in n) {
    if (n['#'].match(/^\s*$/)) {
      delete n['#'];
    } else {
      n['#'] = n['#'].trim();
      if (Object.keys(n).length === 1) {
        n = n['#'];
      }
    }
  }
  
  if (el == 'item' || el == 'entry') { // We have an article!
    if (!self.meta.title) { // We haven't yet parsed all the metadata
      Object.merge(self.meta, handleMeta(self.stack[0], self.meta['#type']), true);
      //self.emit('meta', self.meta);
    }
    item = handleItem(n, self.meta['#type']);
    item.meta = self.meta;
    if (self.meta.author && !item.author) item.author = self.meta.author;
    //self.emit('article', item);
    self.articles.push(item);
  } else if ((el == 'channel' || el == 'feed') && !self.meta.title) { // We haven't yet parsed all the metadata
    Object.merge(self.meta, handleMeta(n, self.meta['#type']), true);
    //self.emit('meta', self.meta);
  }

  if (self.stack.length > 0) {
    if (!self.stack[0].hasOwnProperty(el)) {
      self.stack[0][el] = n;
    } else if (self.stack[0][el] instanceof Array) {
      self.stack[0][el].push(n);
    } else {
      self.stack[0][el] = [self.stack[0][el], n];
    }
  } else {
    self.nodes = n;
  }
};

FeedParser.prototype.handleText = function (text, scope){
  var self = scope;
  if (self.in_xhtml) {
    self.xhtml['#'] += text;
  } else {
    if (self.stack.length) {
      if ('#' in self.stack[0]) {
        self.stack[0]['#'] += text;
      } else {
        self.stack[0]['#'] = text;
      }
    }
  }
};

FeedParser.prototype._reset = function (callback) {
  this.meta = {};
  this.articles = [];
  this.stack = [];
  this.nodes = {};
  this.xmlbase = [];
  this.in_xhtml = false;
  this.xhtml = {}; /* Where to store xhtml elements as associative 
                      array with keys: '#' (containing the text)
                      and '#name' (containing the XML element name) */
  this.errors = [];
  this.callback = ('function' == typeof callback) ? callback : undefined;
}
 w.FeedParser = FeedParser;
})(self || window || exports);