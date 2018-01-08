const assertKeyAndPositionOfError = function(chai,assertFunc,errorFunct,key,pos){
  try{
    eval(errorFunct);
  }catch(err){
    assertFunc(chai,err,key,pos);
  }
}
exports.assertKeyAndPositionOfError=assertKeyAndPositionOfError;

const assertErrorInstance = function(chai,errExp,errorClass) {
  chai.throws(
    ()=>{
      eval(errExp),
      errorClass();
    }
  )
}
exports.assertErrorInstance=assertErrorInstance;
