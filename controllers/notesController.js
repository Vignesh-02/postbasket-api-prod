const User = require('../models/User')
const Note = require('../models/Note')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose')

// @desc GET all Notes
// @route GET /notes
// @acess Private

const getAllNotes = asyncHandler(async (req,res) => {
    
    const notes = await Note.find().lean() 
    
    if(!notes?.length){
        return res.status(400).json({ message: 'No notes found'})
    }

    // Adding username to each note before sending the response
    // We can also do this with a for..of loop

    const noteswWithUser = await Promise.all(notes.map(async (note) => {
        // const userId = note.user.toString() 
        // console.log(userId, typeof(userId))
        // const user = await User.findOne({ _id : userId }).exec()


         const user = await User.findById(note.user).exec()
        return { ...note, username: user.username}
    }))
    res.json(noteswWithUser)
})  


// @desc Create new note
// @route POST /notes
// @acess Private

const createNewNote = asyncHandler(async (req,res) => {
    const { user, title, text, completed } = req.body

    //Confirm data
    if(!user || !title || !text ){
        return res.status(400).json({ message: 'All fields are required '})
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    
    if(duplicate){
        return res.status(409).json({ message: 'Duplicate note title'})
    }
    
    const noteObject = { user, title, text, completed}
    // Create and store new note
    const note = await Note.create(noteObject)


    if(note){
        res.status(201).json({ message: `New note received`})
    }else{
        res.status(400).json({ message: 'Invalid note data received'})
    }

})  



// @desc Update a note
// @route PATCH /notes
// @acess Private 

const updateNote = asyncHandler(async (req,res) => {
    const { id, user, title, text, completed } = req.body
    console.log(req.body)
        // confirm data
     if(!id || !user || !title || !text || typeof completed !== 'boolean'){
        return res.status(400).json({ message: 'All fields are required '})
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: 'ID sent is incorrect '})

    if(!note){
        return res.status(400).json({ message: 'Note not found '})
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
    
    // Allow duplicates to the original user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate note title '})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
    
    const updatedNote = await note.save()

    res.json({ message: `Note with Title: ${updatedNote.title} has been updated`})
})

// @desc Delete a user
// @route DELETE /users
// @acess Private

const deleteNote = asyncHandler(async (req,res) => {
    const { id } = req.body

    if(!id){
        return res.status(400).json({ message: 'Note ID required '})
    }

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: 'ID sent is incorrect '})


    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({ message: 'Note not found '})
    }

    const result = await note.deleteOne()

    const reply = `Note with Title: ${result.title} and with ID: ${result._id} has been deleted`

    res.json({successMessage : reply })

})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}