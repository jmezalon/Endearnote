const db = require('./index.js');


const getAllNotes = (req, res, next) => {
  userid = req.user.id
  db.any(`SELECT notes.id, notes.notebook_id, notes.body, notes.title, notes.tag, nb.notebook_type
  FROM notebooks AS nb
  FULL JOIN users AS u
  ON nb.user_id = u.id
  JOIN notes ON notes.notebook_id = nb.id
  WHERE u.id =$1`, [userid])
  .then(notes => {
    res.status(200)
    .json({
      status: 'success',
      notes: notes,
      message: 'This is all your notes'
    })
  })
  .catch(err => next(err, "this is for all notes"));
}


const getOneNote = (req, res, next) => {
  let noteId = req.params.id;
  db.one('SELECT * FROM notes WHERE id=$1', noteId)
  .then((note) => {
    res.status(200)
    .json({
      status: 'success',
      note: note,
      message: 'this is ONE note'
    })
  })
  .catch(err => next(err));
}


const createNote = (req, res, next) => {
  req.body.tag = req.body.tag ? req.body.tag : null
  req.body.notebook_id = parseInt(req.body.notebook_id) ? parseInt(req.body.notebook_id) : null
  req.body.title = req.body.title ? req.body.title : null
  // should we have created_at in the insert below and if we do have it how do we add the TIMESTAMP
  db.one('INSERT INTO notes(title, notebook_id, body, tag) VALUES(${title}, ${notebook_id}, ${body}, ${tag}) RETURNING *', req.body)
  .then((note) => {
    res.status(200)
    .json({
      status: 'success',
      note: note,
      message: 'you added a new note'
    })
  })
  .catch(err => next(err));
}


const editNote = (req, res, next) => {
  // console.log(req.body)
  let queryStringArray = [];
  let bodyKeys = Object.keys(req.body);
  bodyKeys.forEach(key => {
    queryStringArray.push(key + "=${" + key + "}");
  });
  let queryString = queryStringArray.join(", ")
  db.none(
      'UPDATE notes SET ' + queryString + ' WHERE id=' + req.params.id, req.body
    )
    .then(() => {
      res.status(200)
      .json({
        status: "success",
        message: "Updated a note!"
      });
    })
    .catch(err => {
      console.log(err)
      return next(err)
    });
};

const deleteNote = (req, res, next) => {
  let noteId = parseInt(req.params.id);
  db.result('DELETE FROM notes WHERE id=$1', noteId)
  .then(result => {
    res.status(200)
    .json({
      status: 'success',
      message: 'you deleted this note',
      result: result
    })
  })
  .catch(err => next(err));
}

module.exports = { getAllNotes, getOneNote, createNote, editNote, deleteNote };
