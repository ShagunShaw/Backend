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
//             req.status(err.code  ||  500).json(json_val)        // This 'json_val' is returned to the frontend
//         }
// } 
// } return




// Using the Promise method
const asyncHandler= (func) => {
    (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((err) => next(err))
    }
}



export {asyncHandler}       // Same as 'export default asyncHandler', just another way to write it