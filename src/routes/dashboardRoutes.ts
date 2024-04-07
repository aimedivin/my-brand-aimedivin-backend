/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: The dashboard side managing API, Admin should be authenticated
 * 
 * /api/dashboard/blogs:
 *   get:
 *     summary: Returns a lists of all blogs
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/twoZeroZeroBlogs'
 * 
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *  
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 * /api/dashboard/blog/:
 *   post:
 *     summary: Creates a new blog
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Blog was created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog created successfully!
 *                 blog:
 *                   type: object
 *                   $ref: '#/components/schemas/Blog'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       409:
 *         description: Blog data duplication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The details provided belong to another blog in the database
 *       415:
 *         description: No image provided or unsupported media file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: No image provided..
 *       422:
 *         description: Data Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed, Invalid data
 *       500:
 *         $ref: '#/components/responses/serverError'
 *         
 * 
 * /api/dashboard/blog/{blogId}:
 *   get:
 *     summary: Returns a lists of all blogs
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *      
 *     responses:
 *       200:
 *         description: Return single blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
 *                 blogs:
 *                   type: object
 *                   $ref: '#/components/schemas/Blog'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 *   put:
 *     summary: Update blog by id
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of blog
 *     responses:
 *       200:
 *         description: The blog updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
 *                 blog:
 *                   type: object
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       409:
 *         description: Blogs data duplication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: The details provided belong to another blog in the database
 *       415:
 *         description: Unsupported Media Type for the uploaded photo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: Unsupported Media Type.
 *       500:
 *         $ref: '#/components/responses/serverError'
 *   delete:
 *     summary: Delete a blog by id
 *     tags: [Dashboard]
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
 *         description: The blog deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog and it's comment(s) was deleted successfully
 *       400:
 *         $ref: '#/components/responses/fourZeroZeroBlog'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       404:
 *         $ref: '#/components/responses/fourZeroFourBlog'
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 * /api/dashboard/users:
 *   get:
 *     summary: Returns a lists of all users
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users were retrieved successfully
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       500:
 *         $ref: '#/components/responses/serverError'
 *
 * 
 * /api/dashboard/messages:
 *   get:
 *     summary: Returns a lists of all messages
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - properties:
 *                       message:
 *                         type: string
 *                         example: Messages fetched successfully!
 *                       blogs:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       500:
 *         $ref: '#/components/responses/serverError'
 * 
 * /api/dashboard/messages/{msgId}:
 *   get:
 *     summary: Returns a message by id
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: msgId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of message
 *     responses:
 *       200:
 *         description: Message was retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message fetched successfully
 *                 msg:
 *                   type: object
 *                   $ref: '#/components/schemas/Message'
 *         
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       500:
 *         $ref: '#/components/responses/serverError'
 * /api/dashboard/comments:
 *   get:
 *     summary: Retrieves a all blog comments
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comment are successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comments fetched successfully!
 *                 comments:
 *                   type: array
 *                   items:
 *                     properties:
 *                       username:
 *                         type: string
 *                       photo:
 *                         type: string
 *                       description:
 *                         type: string
 *         
 *       401:
 *         $ref: '#/components/responses/fourZeroOneAuth'
 *       500:
 *         $ref: '#/components/responses/serverError'
 */


import { Router, RequestHandler } from "express";
import { body } from "express-validator";

import { Dashboard } from "../controllers/dashboard";
import { isAdminAuth } from '../middleware/isAuth'

const router = Router();

const dashboardController = new Dashboard();

router.get("/blogs", isAdminAuth, dashboardController.getBlogs);

router.get("/blog/:blogId", isAdminAuth, dashboardController.getBlog);

router.put(
    "/blog/:blogId",
    isAdminAuth,
    [
        body("title").trim().isLength({ min: 5 }),
        body("description").trim().isLength({ min: 5 }),
    ],
    dashboardController.updateBlog
);

router.post(
    "/blog",
    isAdminAuth,
    [
        body("title").trim().isLength({ min: 5 }),
        body("description").trim().isLength({ min: 5 }),
    ],
    dashboardController.postBlog
);

router.delete("/blog/:blogId", isAdminAuth, dashboardController.deleteBlog);

// Users
router.get("/users", isAdminAuth, dashboardController.getUsers);

// Messages
router.get("/messages", isAdminAuth,dashboardController.getMessages);

router.get("/messages/:msgId", isAdminAuth,dashboardController.getMessage);

router.get("/comments", isAdminAuth,dashboardController.getComments);

export default router;
