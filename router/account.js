/* eslint 'max-len' : ['error', {'code':90}] */
const {Router} = require('express');
const {login, loginAdmin} = require('../model/account');
const router = new Router();

router.get('/', async (req, res)=>{
  if (req.session.user) {
    if (req.session.isAdmin) {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
  }
  await req.useFlash(res);
  return res.render('login', {title: 'Login'});
});

router.post('/', async (req, res)=>{
  const body = req.body;
  if (body.email && body.password) {
    let result = await loginAdmin(body.email, body.password);
    if (result.length) {
      await req.flash('success', `Bienvenido Administrador(a).`);
      req.session.user = result[0];
      req.session.isAdmin = true;
      return req.session.save(()=>{
        res.redirect('/admin');
      });
    }
    result = await login(body.email, body.password);
    if (result.length) {
      await req.flash('success', `Bienvenido Doctor(a) ${result[0].nombre}.`);
      req.session.user = result[0];
      req.session.isAdmin = false;
      return req.session.save(()=>{
        res.redirect('/dashboard');
      });
    }
  }
  await req.flash('danger', 'Correo o password incorrectos.Usuario no encontrado.');
  await req.useFlash(res);
  return res.render('login', {title: 'Login'});
});

router.get('/logout', (req, res) => {
  return req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
