import mongoose from 'mongoose'
//import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'users'

const schema = new mongoose.Schema({
    first_name: { type: String, required: true, index: true },
    last_name: { type: String, required: true },
    age: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, required: false },
});

//schema.plugin(mongoosePaginate)

export default mongoose.model(collection, schema)