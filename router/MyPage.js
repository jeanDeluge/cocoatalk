const router = require('express').Router();

router.get('mypage', (req, res)=> {
    res.send('This is mypage')
})