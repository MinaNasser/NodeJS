
//const bycrept=require('bcrypt');
function x(nums)
{
    var maxint = Math.pow(2, 53)
    var max_so_far = -maxint - 1
    var max_ending_here = 0
      
    for (var i = 0; i < nums.length; i++)
    {
        max_ending_here = max_ending_here + nums[i]
        if (max_so_far < max_ending_here)
            max_so_far = max_ending_here
 
        if (max_ending_here < 0)
            max_ending_here = 0
    }
    return max_so_far
}

console.log(x([-2,1]))

// const  events = require('events');
// var eventEmitter = new events();

// class Univercity
// {
//     constructor()
//     {
//         this.students=[];
//     }

//     addStudent(data) {
//         this.students.push(data);
//         eventEmitter.emit("data saved in db") 
//     }



// }
// eventEmitter.on("data saved in db",function()
// {
//     console.log("pk")
// })

// async function hash(text)
// {
//     const salt=await bycrept.genSalt(10);
//     const hasing=await bycrept.hash(text,salt);
//     console.log(hasing);
//     let flag=await bycrept.compare(text,hasing);
//     console.log(flag)
// }


// hash("123456789")