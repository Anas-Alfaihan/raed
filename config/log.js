import fs from 'fs'
import morgan from 'morgan'
import path from 'path'

export default (app) => {
    var accessLogStream = fs.createWriteStream(
        path.join(path.resolve('__dirname'), '../log/access.log'),
        {
            interval: '1d', // rotate daily
            flags: 'a',
        }
    )
    // setup the logger
    app.use(
        morgan(
            'method::method state::status url::url response-time: :response-time ms http-version: HTTP/:http-version" content-length::res[content-length]  address::remote-addr date_web:[:date[web]]  ',
            {
                stream: accessLogStream,
            }
        )
    )
}
