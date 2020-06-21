var mongoose=require('../../cfg/dbconfig.js')

//转学学生信息模型
var transschoolSchema=new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    'stuname':String,
    'gender':String,
    'born':String,
    'nation':String,
    'hometown':String,
    'fname':String,
    'sname':String,
    'fwork':String,
    'swork':String,
    'foffice':String,
    'soffice':String,
    'fedu':String,
    'sedu':String,
    'sourceschool':String,
    'stupid':String,
    'regaddress':String,
    'homeaddress':String,
    'ftel':String,
    'stel':String,
    'transgrade':String,
},{collection:'transschool'})

transschoolSchema.statics.Save=async function(doc){
    let obj=new this(doc);
    let res=await obj.save();
    return res;
}

//分页查询

transschoolSchema.statics.myPaging=async function (keyword, pagesize, lastid) {
    var query = {}
    let reco = []
    if (lastid) {
        query = {
            $or: [
                { 'stuname': { $regex: keyword } },
                { 'stupid': { $regex: keyword } }
            ],
            _id: { $lt: lastid }
        }
    } else {
        query = {
            $or: [
                { 'stuname': { $regex: keyword } },
                { 'stupid': { $regex: keyword } }
            ]
        }
    }

    let countQuery={
        $or:[
            {'stuname':{$regex:keyword}},
            {'stupid':{$regex:keyword}}
        ]
    }

    if(pagesize==-1){
        reco = await this
        .find(query)
        .sort({ _id: -1 })
        .exec();
    }else{
    reco = await this
            .find(query)
            .sort({ _id: -1 })
            .limit(pagesize)
            .exec();
    }
    let count=await this.countDocuments(countQuery).exec();
    return {"recordset":reco,"count":count}
}
module.exports=mongoose.model('transschool',transschoolSchema)
