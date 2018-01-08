const src=function(filePath){return "../src/"+filePath};
const errors=function(filePath){return "../src/errors/"+filePath};

const chai = require('chai').assert;
const StrictParser=require(src('index.js')).StrictParser;
const InvalidKeyError=require(errors('invalidKeyError.js'));

var invalidKeyErrorChecker=function(key,pos) {
  return function(err) {
    if(err instanceof InvalidKeyError && err.invalidKey==key && err.position==pos)
      return true;
    return false;
  }
}

const assertErrorInstance = function(chai,errExp,errorClass) {
  chai.throws(
    ()=>{
      eval(errExp);
    },
    errorClass()
  )
}

const assertKeyAndPositionOfError=function(err,key,position) {
  chai.equal(err.invalidKey,key);
  chai.equal(err.position,position);
}

describe("strict parser",function(){
  it("should only parse keys that are specified for a single key",function(){
    let kvParser=new StrictParser(["name"]);
    let errExp = 'var p=kvParser.parse("age=23")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      var p=kvParser.parse("age=23");
    }catch(err){
      assertKeyAndPositionOfError(err,"age",5);
    }
  });

  it("should only parse keys that are specified for multiple keys",function(){
    let kvParser=new StrictParser(["name","age"]);
    let actual=kvParser.parse("name=john age=23");
    let expected={name:"john",age:"23"};
    chai.deepInclude(expected,actual);
    let errExp = 'var p=kvParser.parse("color=blue")'
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      var p=kvParser.parse("color=blue");
    }catch(err){
      chai.equal(err.invalidKey,"color");
      chai.equal(err.position,9);
    }
  });

  it("should throw an error when one of the keys is not valid",function(){
    let errExp = 'let kvParser=new StrictParser(["name","age"])\n'+
                  'kvParser.parse("name=john color=blue age=23")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      let kvParser=new StrictParser(["name","age"]);
      kvParser.parse("name=john color=blue age=23");
    }catch(err){
      assertKeyAndPositionOfError(err,"color",20);
    }
  });

  it("should throw an error on invalid key when there are spaces between keys and assignment operators",function(){
    let errExp = 'let kvParser=new StrictParser(["name","age"])\n'+
                  'kvParser.parse("color   = blue")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      let kvParser=new StrictParser(["name","age"]);
      kvParser.parse("color   = blue");
    }catch(err){
      assertKeyAndPositionOfError(err,"color",13);
    }
  });

  it("should throw an error on invalid key when there are quotes on values",function(){
    let errExp = 'let kvParser=new StrictParser(["name","age"])\n'+
                  'kvParser.parse("color   = \"blue\"")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      let kvParser=new StrictParser(["name","age"]);
      kvParser.parse("color   = \"blue\"");
    }catch(err){
      assertKeyAndPositionOfError(err,"color",15);
    }
  });

  it("should throw an error on invalid key when there are cases of both quotes and no quotes",function(){
    let errExp = 'let kvParser=new StrictParser(["name","age"])\n'+
                  'kvParser.parse("name = john color   = \"light blue\"")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      let kvParser=new StrictParser(["name","age"]);
      kvParser.parse("name = john color   = \"light blue\"");
    }catch(err){
      assertKeyAndPositionOfError(err,"color",33);
    }
  });

  it("should throw an error when no valid keys are specified",function(){
    let errExp = 'let kvParser=new StrictParser([])\n'+
                  'kvParser.parse("name=john")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      let kvParser=new StrictParser([]);
      kvParser.parse("name=john");
    }catch(err){
      assertKeyAndPositionOfError(err,"name",8);
    }
  });

  it("should throw an error when no array is passed",function(){
    let errExp = 'let kvParser=new StrictParser()\n'+
                  'kvParser.parse("name=john")';
    assertErrorInstance(chai,errExp,InvalidKeyError);
    try{
      let kvParser=new StrictParser();
      kvParser.parse("name=john");
    }catch(err){
      assertKeyAndPositionOfError(err,"name",8);
    }
  });

});
