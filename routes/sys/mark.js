const router = require('koa-router')()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const term = require('../../models/schoolterm.js');
const crypto = require('crypto')

router.prefix('/sys/mark')

router.post('/termAdd/', async (ctx, next) => {
    ctx.request.body
    try{
        let result=await term.Save(ctx.) 
    }
    //ctx.body = accts;
})