const allowedOrigins = require('./allowedOrigins')

const corsOptions =  {
    origin: (origin,callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            // No error and success
            callback(null,true)
        }else{
            console.log(allowedOrigins.indexOf(origin))
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions