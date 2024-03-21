/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - password
 *         - isAdmin
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id for the user
 *         email:
 *           type: string
 *           description: Email for the user
 *         name:
 *           type: string
 *           description: Names for the user
 *         password:
 *           type: string
 *           description: Hashed password for the user
 *         isAdmin:
 *           type: boolean
 *           description: User role
 *           example: false
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - imageUrl
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the blog
 *         title:
 *           type: string
 *           description: The title of your blog
 *         description:
 *           type: string
 *           description: The blog explanation
 *         imageUrl:
 *           type: string
 *           description: The link for the blog image
 *
 *     Comment:
 *       type: object
 *       required:
 *         - creatorId
 *         - blogId
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         creatorId:
 *           type: string
 *           description: The id of commenter
 *         blogId:
 *           type: string
 *           description: The id of blog which comment was made to
 *         description:
 *           type: string
 *           description: The message
 *
 *     Message:
 *       type: object
 *       required:
 *         - email
 *         - subject
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the message
 *         email:
 *           type: string
 *           description: The email of sender
 *         subject:
 *           type: string
 *           description: The subject of message
 *         description:
 *           type: string
 *           description: The message
 *   responses:
 *     fourZeroOneAuth:
 *       description: Authentication error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: You're not authorized
 *     serverError:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Server error
 *     twoZeroZeroBlogs:
 *       description: List of the blogs
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       type: string
 *                       example: Blogs fetched successfully!
 *                     blogs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Blog'
 *     
 *     fourZeroZeroBlog:
 *       description: Incorrect syntax for Id
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Invalid id
 *
 *     fourZeroFourBlog:
 *       description: The blog was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Blog not found
 * 
 */
/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: The portfolio side managing API
 * 
 * /api/portfolio/blogs:
 *   get:
 *     summary: Returns a lists of all blogs
 *     tags: [Portfolio]
 *     responses: 
 *       200:
 *        description: List of the blogs
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string
 *                   example: Internal server error
 *    
 *       
 * /api/portfolio/blog/{blogId}:
 *   get:
 *     summary: Returns single blog by blogId
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *     responses:
 *       200:
 *         description: The blog response by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid blog Id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid blog id
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       500:
 *         $ref: '#/components/responses/serverError'
 *  
 * /api/portfolio/{blogId}/comment:
 *   get:
 *     summary: Returns Comments for specific blog
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *     responses:
 *       200:
 *         description: The comment response by the blog id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog comments
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 *   post:
 *     summary: Creates new comment
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment posted successfully!
 *                 comment:
 *                   type: object
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       500:
 *         $ref: '#/components/responses/serverError'
 *
 * 
 * /api/portfolio/{blogId}/like:
 *   post:
 *     summary: Posts like for specific blog
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *     responses:
 *       201:
 *         description: Like created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like added successfully!
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       409:
 *         description: Like duplication on single blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like you're trying to add on this blog already exist, you can't add another
 *       500:
 *         $ref: '#/components/responses/serverError'
 *
 * 
 *   delete:
 *     summary: Remove like onto specific blog
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *     responses:
 *       200:
 *         description: Like deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like removed successfully!
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 * /api/portfolio/message:
 *   post:
 *     summary: Saves a message
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent
 *         content: 
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         $ref: '#/components/responses/serverError'
 *            
 */

import { Router } from "express";
import { Portfolio } from "../controllers/portfolio"

import { isAuth, isAuthAdmin } from '../middleware/isAuth'

const router = Router();

const portfolioController = new Portfolio();

// Getting Blog(s)
router.get("/blogs", portfolioController.getBlogs);

router.get("/blog/:blogId", portfolioController.getBlog);

// Blog comment 
router.get('/blog/:blogId/comment', portfolioController.getComments);

router.post('/blog/:blogId/comment', isAuth, portfolioController.postComment);

// Blog like 
router.post('/blog/:blogId/like', isAuth, portfolioController.postLike);

router.delete('/blog/:blogId/like', isAuth, portfolioController.deleteLike);

// Contact form message
router.post('/message', portfolioController.postMessage);



export default router;