// There are two ways of handling an async function: i) using try-catch block; or    ii) using .then-.catch block since async function always returns a promise

// Using try-catch block
// const asyncHandler= (func) => {      // req, res, next are implicit parameters. You don’t pass them — Express passes them automatically when it executes the returned function.
//         try
//         {
//             await func(req, res, next)
//         } 
//         catch(err) 
//         {
//             const json_val= {
//                 success: false,
//                 message: err.message
//             }
//             res.status(err.code  ||  500).json(json_val)        // This 'json_val' is returned to the frontend
//         }
// } 




// Using the Promise method
const asyncHandler= (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((err) => next(err))
        // This line is not a code of .then-.catch part. 'Promise.resolve(...)' simply says execute this function 'func' and if there is an error while executing this func,
        // then throw that errror and 'catch' will catch that error in 'err' and then the command is transferred to the catch-block and it knows what to do next
    }
}


export {asyncHandler}       // Same as 'export default asyncHandler', just another way to write it