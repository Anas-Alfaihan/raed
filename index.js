import app from './app.js'
import { cleanTokens } from './utils/scheduler.js'
//run at port
app.listen(process.env.PORT, async () => {
    //just for clean expired token at 12 night every day , the 1 minute ,  between 1 and 3 second
    await cleanTokens()
    console.log(`Server Run of Port : ${process.env.PORT}  ✔✅`)
})
