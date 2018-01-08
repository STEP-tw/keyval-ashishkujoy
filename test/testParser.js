const src=function(filePath){return "../src/"+filePath};
const errors=function(filePath){return "../src/errors/"+filePath};

const chai = require('chai').assert;
const Parser=require(src('index.js')).Parser;
const Parsed = require(src('parsed.js'));
const MissingValueError=require(errors('missingValueError.js'));
const MissingEndQuoteError=require(errors('missingEndQuoteError.js'));
const MissingKeyError=require(errors('missingKeyError.js'));
const MissingAssignmentOperatorError=require(errors('missingAssignmentOperatorError.js'));
const IncompleteKeyValuePairError=require(errors('incompleteKeyValuePairError.js'));

const assertKeyAndPositionOfError = function(err,key,pos){
  chai.equal(err.key,key);
  chai.equal(err.position,pos);
}

const newError = function(errorMessage,key,pos){
  let error = new Error();
  error.key = key;
  error.position = pos;
  return error;
}

const assertKeyPosition = function(chai,errorFunct,key,pos){
  try{
    eval(errorFunct);
  }catch(err){
    assertKeyAndPositionOfError(err,key,pos);
  }
}

const assertErrorInstance = function(chai,errExp,errorClass) {
  chai.throws(
    ()=>{
      eval(errExp),
      errorClass();
    }
  )
}

var kvParser;
var expected;

beforeEach(function(){
  kvParser=new Parser();
  expected = new Parsed();
});

describe("parse basic key values",function(){

  it("parses an empty string",function(){
    let actual=kvParser.parse("");
    chai.equal(0,actual.length());
  });

  it("parse key=value",function(){
    let actual=kvParser.parse("key=value");
    chai.equal("value",actual.key);
    chai.equal(1,actual.length());
  });

  it("parse when there are leading spaces before key",function(){
    let actual=kvParser.parse(" key=value");
    expected['key'] = 'value';
    chai.deepEqual(expected,kvParser.parse(" key=value"));
  });

  it("parse when there are spaces after key",function(){
    expected['key']="value";
    chai.deepEqual(expected,kvParser.parse("key =value"));
  });

  it("parse when there are spaces before and after key",function(){
    expected['key']="value";
    chai.deepEqual(expected,kvParser.parse(" key =value"));
  });

  it("parse when there are spaces before value",function(){
    expected['key']="value";
    chai.deepEqual(expected,kvParser.parse("key= value"));
  });

  it("parse when there are spaces after value",function(){
    expected['key']="value";
    chai.deepEqual(expected,kvParser.parse("key=value "));
  });
});

describe("parse digits and other special chars",function(){

  it("parse keys with a single digit",function(){
    expected['1']="value";
    chai.deepEqual(expected,kvParser.parse("1=value"));
  });

  it("parse keys with only multiple digits",function(){
    expected['123']="value";
    chai.deepEqual(expected,kvParser.parse("123=value"));
  });

  it("parse keys with leading 0s",function(){
    expected['0123']="value";
    chai.deepEqual(expected,kvParser.parse("0123=value"));
  });

  it("parse keys with underscores",function(){
    expected['first_name']="value";
    chai.deepEqual(expected,kvParser.parse("first_name=value"));
  });

  it("parse keys with a single underscore",function(){
    expected['_']="value";
    chai.deepEqual(expected,kvParser.parse("_=value"));
  });

  it("parse keys with multiple underscores",function(){
    expected['__']="value";
    chai.deepEqual(expected,kvParser.parse("__=value"));
  });

  it("parse keys with alphabets and digits(digits leading)",function(){
    expected['0abc']="value";
    chai.deepEqual(expected,kvParser.parse("0abc=value"));
  });

  it("parse keys with alphabets and digits(alphabets leading)",function(){
    expected['a0bc']="value";
    chai.deepEqual(expected,kvParser.parse("a0bc=value"));
  });
});

describe("multiple keys",function(){

  it("parse more than one key",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("key=value anotherkey=anothervalue"));
  });

  it("parse more than one key when keys have leading spaces",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("   key=value anotherkey=anothervalue"));
  });

  it("parse more than one key when keys have trailing spaces",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("key  =value anotherkey  =anothervalue"));
  });

  it("parse more than one key when keys have leading and trailing spaces",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("  key  =value anotherkey  =anothervalue"));
  });
});

describe("single values with quotes",function(){

  it("parse a single value with quotes",function(){
    expected['key']='value';
    chai.deepEqual(expected,kvParser.parse("key=\"value\""));
  });

  it("parse a single quoted value that has spaces in it",function(){
    expected["key"]="va lue";
    chai.deepEqual(expected,kvParser.parse("key=\"va lue\""));
  });

  it("parse a single quoted value that has spaces in it and leading spaces",function(){
    expected["key"]="va lue";
    chai.deepEqual(expected,kvParser.parse("key=   \"va lue\""));
  });

  it("parse a single quoted value that has spaces in it and trailing spaces",function(){
    expected["key"]="va lue";
    chai.deepEqual(expected,kvParser.parse("key=\"va lue\"   "));
  });
});

describe("multiple values with quotes",function(){

  it("parse more than one value with quotes",function(){
    expected["key"]="va lue";
    expected["anotherkey"]="another value";
    chai.deepEqual(expected,kvParser.parse("key=\"va lue\" anotherkey=\"another value\""));
  });

  it("parse more than one value with quotes with leading spaces",function(){
    expected["key"]="va lue";
    expected["anotherkey"]="another value";
    chai.deepEqual(expected,kvParser.parse("key= \"va lue\" anotherkey= \"another value\""));
  });

  it("parse more than one value with quotes when keys have trailing spaces",function(){
    expected["key"]="va lue";
    expected["anotherkey"]="another value";
    chai.deepEqual(expected,kvParser.parse("key = \"va lue\" anotherkey = \"another value\""));
  });
});

describe("mixed values with both quotes and without",function(){

  it("parse simple values with and without quotes",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("key=value anotherkey=\"anothervalue\""));
  });

  it("parse simple values with and without quotes and leading spaces on keys",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("   key=value anotherkey=\"anothervalue\""));
  });

  it("parse simple values with and without quotes and trailing spaces on keys",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("key  =value anotherkey  =\"anothervalue\""));
  });

  it("parse simple values with and without quotes and leading and trailing spaces on keys",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("  key  =value anotherkey  = \"anothervalue\""));
  });

  it("parse simple values with and without quotes(quoted values first)",function(){
    expected["key"]="value";
    expected["anotherkey"]="anothervalue";
    chai.deepEqual(expected,kvParser.parse("anotherkey=\"anothervalue\" key=value"));
  });
});

describe("error handling",function(){

  it("throws error on missing value when value is unquoted",function(){
      let errExp = 'kvParser.parse("key=")';
      assertErrorInstance(chai,errExp,MissingValueError);
      assertKeyPosition(chai,errExp,"key",3);
  });

  it("throws error on missing value when value is quoted",function(){
    chai.throws(
      () => {
        kvParser.parse("key=\"value")
      },
      MissingEndQuoteError()
      )
      try{
        kvParser.parse("key=\"value");
      }catch(err){
        assertKeyAndPositionOfError(err,"key",9);
      }
  });

  it("throws error on missing key",function(){
      let errExp = 'kvParser.parse("=value")';
      assertErrorInstance(chai,errExp,MissingKeyError);
      assertKeyPosition(chai,errExp,undefined,0);
  });

  it("throws error on invalid key",function(){
    chai.throws(
      () => {
        kvParser.parse("'foo'=value")
      },
      MissingKeyError()
      )

      try{
        kvParser.parse("'foo'=value");
      }catch(err){
        assertKeyAndPositionOfError(err,undefined,0);
      }
  });

  it("throws error on missing assignment operator",function(){
      let errExp = 'kvParser.parse("key value")';
      assertErrorInstance(chai,errExp,MissingAssignmentOperatorError);
      assertKeyPosition(chai,errExp,undefined,4);
  });

  it("throws error on incomplete key value pair",function(){
      let errExp = 'kvParser.parse("key")';
      assertErrorInstance(chai,errExp,IncompleteKeyValuePairError)
      assertKeyPosition(chai,errExp,undefined,2);
  });

});
