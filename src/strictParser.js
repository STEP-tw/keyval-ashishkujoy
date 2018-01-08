const Parser=require("./keyValueParser.js");
const strictParseInfoCreator=require("./parseInfoCreator.js").strict;

const toUpperCase = function(string) {
  return string.toUpperCase();
}

var StrictParser=function(listOfKeys,caseSensitivity) {
  Parser.call(this);
  let sanitisedListOfKeys=listOfKeys||[];
  if(caseSensitivity==null) caseSensitivity=true;
  this.parseInfoCreator=strictParseInfoCreator(sanitisedListOfKeys,caseSensitivity);
}

StrictParser.prototype=Object.create(Parser.prototype);
module.exports=StrictParser;
