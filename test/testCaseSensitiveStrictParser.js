const src=function(filePath){return "../src/"+filePath};

const assert=require('chai').assert;
const Parsed=require(src('parsed.js'));
const StrictParser=require(src('index.js')).StrictParser;

describe("strict parser that is case insensitive",function(){
  it("should parse when specified keys are in lower case and actual is not",function(){
    let kvParser=new StrictParser(["name"],false);
    // false indicates that case sensitive is false. By default it is true
    let expected=new Parsed();
    expected["NAME"]="jayanth";
    let parsed=kvParser.parse("NAME=jayanth");
    assert.deepEqual(parsed,expected);
  });
  it('should parse when specified keys are partially in lower case and actual is fully lower case',function(){
    let kvParser = new StrictParser(['Name'],false);
    let expected=new Parsed();
    expected["name"]="jayanth";
    let parsed=kvParser.parse("name=jayanth");
    assert.deepEqual(parsed,expected);
  });
  it('should parse when actual keys are partially in lower case and specified keys is completely lower case',function(){
    let kvParser = new StrictParser(['name','company'],false);
    let expected=new Parsed();
    expected["NaMe"]="jayanth";
    expected["ComPany"]="thoughtworks";
    let parsed=kvParser.parse("NaMe=jayanth ComPany=thoughtworks");
    assert.deepEqual(parsed,expected);
  })
});

describe("strict parser that is case sensitive",function(){
  it("should throw error when specified keys are in lower case and actual is not",function(){
    let kvParser=new StrictParser(["name"],true);
    // true indicates that parser is case sensitive
    assert.throws(()=>{
      kvParser.parse("NAME=jayanth");
    })
  });
  it("should throw error when specified keys are in upper case and actual is not",function(){
    let kvParser=new StrictParser(["NAME"],true);
    assert.throws(()=>{
      kvParser.parse("name=jayanth");
    })
  })
});
