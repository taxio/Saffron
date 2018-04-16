import express from 'express';
import * as data from './data';

const app = express();

app.post('/login', (req, res) => {
  if(req.params.email === 'test@test.com' && req.params.password === 'hogehoge'){
    res.json({token: data.token});
  }else{
    res.json({error: 'auth error'});
  }
});

app.get('/', (req, res) => {
  res.json({test: "Hello Saffron mock server"});
});

app.listen(3000);