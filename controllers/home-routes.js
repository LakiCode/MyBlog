const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');

// get all posts for homepage
router.get('/', (req, res) => {
  console.log('============first==========');
  User.findAll({
    attributes: ['id'],
    include: [
      {
        model: Post,
        attributes: ['id', 'title', 'content', 'created_at', 'user_id'],
        include: [
          {
            model: Comment,
            attributes: [
              'id',
              'comment_text',
              'post_id',
              'user_id',
              'created_at',
            ],
            include: {
              model: User,
              attributes: ['username'],
            },
          },
          {
            model: User,
            attributes: ['username'],
          },
        ],
      },
    ],
  })
    .then((dbUserData) => {
      const users = dbUserData.map((user) => user.get({ plain: true }));
      const posts = users.reduce((posts, user) => posts.concat(user.posts), []);
      res.render('homepage', {
        posts,
        users,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// render sign in
router.get('/signin', (req, res) => {
  res.render('signin');
});
// get single post
router.get('/post/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ['id', 'title', 'content', 'created_at'],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username'],
        },
      },
      {
        model: User,
        attributes: ['username'],
      },
    ],
  })
    .then((dbPostData) => {
      //console.log('what is ' + post);
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }

      const post = dbPostData.get({ plain: true });

      res.render('single-post', {
        post,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/login', (req, res) => {
  console.log('let me in');
  console.log(req.session);
  if (req.session.loggedIn) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});

module.exports = router;
