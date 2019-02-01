db.base.update(
   {"teaching":{$exists:1}},
   { $push: { "teaching.$[t].subject": '信息技术' } },
   { arrayFilters: [ { "t.term": "2018年春季学期" }],upsert : true, multi: true}
)