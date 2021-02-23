const validation = require('./validation');

test('IsDNI - Numbers and letters', ()=>{
  expect(validation.isDNI('3d2f42')).toBe(false);
});

test('IsDNI - Many numbers text', ()=>{
  expect(validation.isDNI('53532532532523')).toBe(false);
});

test('IsDNI - Only letters', ()=>{
  expect(validation.isDNI('dkfkmfro')).toBe(false);
});

test('IsDNI - Correct format', ()=>{
  expect(validation.isDNI('03940249')).toBe(true);
});

test('IsDNI - Nine numbers text', ()=>{
  expect(validation.isDNI('039402493')).toBe(false);
});

test('IsDNI - seven numbers text', ()=>{
  expect(validation.isDNI('0394024')).toBe(false);
});

test('IsDNI - null', ()=>{
  expect(validation.isDNI(null)).toBe(false);
});

test('IsDNI - undefined', ()=>{
  expect(validation.isDNI(undefined)).toBe(false);
});

test('IsDNI - numbers', ()=>{
  expect(validation.isDNI(394024)).toBe(false);
});

test('IsDNI - Eigth numbers', ()=>{
  expect(validation.isDNI(39402444)).toBe(true);
});

test('IsDNI - seven numbers', ()=>{
  expect(validation.isDNI(9402444)).toBe(false);
});

test('IsDNI - decimal', ()=>{
  expect(validation.isDNI(0.09402444)).toBe(false);
});

test('IsDNI - Boolean true', ()=>{
  expect(validation.isDNI(true)).toBe(false);
});

test('IsDNI - Boolean false', ()=>{
  expect(validation.isDNI(false)).toBe(false);
});

test('IsDNI - Object', ()=>{
  expect(validation.isDNI(Object)).toBe(false);
});

test('IsDNI - JSON', ()=>{
  expect(validation.isDNI({})).toBe(false);
});

test('IsDNI - blank', ()=>{
  expect(validation.isDNI()).toBe(false);
});

test('IsCE - Numbers and letters', ()=>{
  expect(validation.isCE('3d2f42')).toBe(false);
});

test('IsCE - Many numbers text', ()=>{
  expect(validation.isCE('53532532532523')).toBe(false);
});

test('IsCE - Only letters', ()=>{
  expect(validation.isCE('dkfkmfro')).toBe(false);
});

test('IsCE - Eight numbers text', ()=>{
  expect(validation.isCE('03940249')).toBe(false);
});

test('IsCE - Correct format', ()=>{
  expect(validation.isCE('039402493')).toBe(true);
});

test('IsCE - seven numbers text', ()=>{
  expect(validation.isCE('0394024')).toBe(false);
});

test('IsCE - null', ()=>{
  expect(validation.isCE(null)).toBe(false);
});

test('IsCE - undefined', ()=>{
  expect(validation.isCE(undefined)).toBe(false);
});

test('IsCE - numbers', ()=>{
  expect(validation.isCE(394024)).toBe(false);
});

test('IsCE - Eigth numbers', ()=>{
  expect(validation.isCE(39402444)).toBe(false);
});

test('IsCE - Nine numbers', ()=>{
  expect(validation.isCE(940244444)).toBe(true);
});

test('IsCE - decimal', ()=>{
  expect(validation.isCE(0.09402444)).toBe(false);
});

test('IsCE - Boolean true', ()=>{
  expect(validation.isCE(true)).toBe(false);
});

test('IsCE - Boolean false', ()=>{
  expect(validation.isCE(false)).toBe(false);
});

test('IsCE - Object', ()=>{
  expect(validation.isCE(Object)).toBe(false);
});

test('IsCE - JSON', ()=>{
  expect(validation.isCE({})).toBe(false);
});

test('IsCE - blank', ()=>{
  expect(validation.isCE()).toBe(false);
});
