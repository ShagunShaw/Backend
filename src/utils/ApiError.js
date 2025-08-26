class ApiError extends Error        // Inheritance
{
    constructor(statusCode, message= "Something went wrong", errors= [], stack= "")
    {
        super(message)          // Overriding the 'message' variable from our Error class
        this.statusCode= statusCode
        this.data= null
        this.message= message      // You want to ensure it's explicitly set (even though super(message) already does it).
        this.success= false
        this.errors= errors

        if(stack)
        {
            this.stack= stack
        }
        else{
            // See from GPT what does a stack trace looks like. Ask for an example of a stacktrace 
            Error.captureStackTrace(this, this.constructor)     // This generates the actual stack trace string and store the value in 'stack'
        }
    }
}


export {ApiError}