import db from "../models/index.cjs";
import bcrypt from "bcrypt";

const userModel = db.User;

const createUser = async (req, res) => {
    try {
        const { userName, mail, password } = req.body;

        if (!userName || !mail || !password) {
            return res.status(400).json({
                error: "userName, email et password sont requis"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            userName,
            mail: mail,      
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "Utilisateur créé",
            userId: newUser.id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erreur serveur"
        });
    }
};

export { createUser };
