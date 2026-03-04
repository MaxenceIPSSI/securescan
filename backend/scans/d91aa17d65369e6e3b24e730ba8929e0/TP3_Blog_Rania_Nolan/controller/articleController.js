
import db from "../models/index.cjs";

const articleModel = db.Article; 

const getAllArticles = async (req, res) => {
    const articles = await articleModel.findAll(); 
    res.json(articles);
}

const getArticleById = async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Bad request" });
    }

    try {
        const post = await articleModel.findByPk(id, {
            include: [
                {
                    model: db.User,
                    as: "user",          
                    attributes: ["id", "userName"] 
                }
            ]
        });

        if (!post) return res.status(404).json({ error: "Not found" });

        res.json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

const createArticle = async (req, res) => {
    const article = req.body;

    const { title, content, userId } = req.body;

    if (!title || !content || !userId) {
        return res.status(400).json({
        error: 'title, content and userId are required',
        });
    }
    try {
        const newArticle = await articleModel.create(article);
        console.log("Article auto-generated ID:", newArticle.id);
        res.status(201).json(newArticle);
    } catch (error) {
        return res.status(500).json({ error: "something went wrong" });
    }

}

const updateArticle = async (req, res) => { 
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Bad request" })
    }

    const article = req.body;
    const { title, content, userId } = req.body;

    if (!title || !content || !userId) {
        return res.status(400).json({
        error: 'title, content and userId are required',
        });
    }
    try {
        const updatingArticle = await articleModel.update(
            article,
            {
                where: {
                    id: id,
                },
            },
        );
        res.json(updatingArticle);


    } catch (error) {
        return res.status(500).json({ error: "somthing went wrong" });
    }


}

const deleteArticle = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Bad request" });
    }

    try {
        const deletedCount = await articleModel.destroy({
            where: { id: id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ error: "Article not found" });
        }

        return res.json({ message: `Article ${id} deleted successfully.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};


export {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
};