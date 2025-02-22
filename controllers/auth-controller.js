const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Require the cloudinary library
const cloudinary = require("cloudinary").v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
    secure: true,
});

const { User } = require("../models/index");

const { HttpError, ctrlWrapper, uploadImage, generateAvatar } = require("../helpers");

const { JWT_SECRET } = process.env;

// Login controller

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid");
    }

    const payload = {
        id: user._id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
        name: user.name,
        theme: user.theme,
        email,
        token,
    });
};

// Register controller

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "User with this email address already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    generateAvatar(name, 200);
    const avatarURL = await uploadImage(`./temp/${name}_avatar.png`);

    await User.create({
        ...req.body,
        password: hashPassword,
        avatarURL,
    });

    // Calling the login controller
    login(req, res);
};

// Getting the current token

const getCurrent = async (req, res) => {
    const { token } = req.user;

    res.json({
        token,
    });
};

// Getting user data

const getUser = async (req, res) => {
    const { name, email, avatarURL, skype, phone, birthday } = req.user;

    res.json({
        name,
        email,
        avatarURL,
        skype,
        phone,
        birthday,
    });
};

// Logout controller

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({ message: "Logout success" });
};

// User data update

const updateUser = async (req, res) => {
    const { id } = req.user;
    let hashPassword;
    const { name, email, password, skype, phone, birthday, theme } = req.body;
    if (password) {
        hashPassword = await bcrypt.hash(password, 10);
    }
    if (!req.file) {
        const result = await User.findByIdAndUpdate(id, { name, email, password: hashPassword, skype, phone, birthday, theme }, { new: true });

        if (!result) {
            throw HttpError(404, "Not found");
        }
        return res.json({
            name: result.name,
            email: result.email,
            skype: result.skype,
            phone: result.phone,
            birthday: result.birthday,
            avatarURL: result.avatarURL,
            theme: result.theme,
        });
    }
    const imagePath = req.file.path;
    const avatarURL = await uploadImage(imagePath, id);

    const result = await User.findByIdAndUpdate(id, { name, email, password: hashPassword, skype, phone, birthday, avatarURL, theme }, { new: true });

    if (!result) {
        throw HttpError(404, "Not found");
    }

    res.json({ name: result.name, email: result.email, skype: result.skype, phone: result.phone, birthday: result.birthday, avatarURL: result.avatarURL, theme: result.theme });
};

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateUser: ctrlWrapper(updateUser),
    getUser: ctrlWrapper(getUser),
};
