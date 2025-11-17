import Investor from '../models/InvestorProfile.js';


const createInvestorProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            investorName,
            investorType,
            location,
            minimumInvestment,
            maximumInvestment,
            riskLevel,
            preferredIndustries,
            investmentInterest,
            description,
            websiteURL
        } = req.body;


        if (!investorName || !investorType || !location || !riskLevel) {
            return res.status(400).json({
                success: false,
                message: "Required fields: investorName, investorType, location, riskLevel"
            });
        }

        const existingInvestor = await Investor.findOne({ userId });
        if (existingInvestor) {
            return res.status(409).json({
                success: false,
                message: "Investor profile already exists"
            });
        }

        const newInvestor = await Investor.create({
            userId,
            investorName,
            investorType,
            location,
            minimumInvestment: Number(minimumInvestment),
            maximumInvestment: Number(maximumInvestment),
            riskLevel,
            preferredIndustries,
            investmentInterest,
            description,
            websiteURL
        });

        return res.status(201).json({
            success: true,
            message: "Investor profile created successfully",
            data: newInvestor
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getMyInvestorProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const investorProfile = await Investor.findOne({ userId });
        if (!investorProfile) {
            return res.status(404).json({
                success: false,
                message: "Investor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Investor profile fetched successfully",
            data: investorProfile
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateInvestorProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const investorProfile = await Investor.findOne({ userId });
        if (!investorProfile) {
            return res.status(404).json({
                success: false,
                message: "Investor profile not found"
            });
        }

        const allowedFields = [
            "investorName",
            "investorType",
            "location",
            "minimumInvestment",
            "maximumInvestment",
            "riskLevel",
            "preferredIndustries",
            "investmentInterest",
            "description",
            "websiteURL"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                // Convert number fields
                if (field === "minimumInvestment" || field === "maximumInvestment") {
                    investorProfile[field] = Number(req.body[field]);
                } else {
                    investorProfile[field] = req.body[field];
                }
            }
        });

        await investorProfile.save();

        return res.status(200).json({
            success: true,
            message: "Investor profile updated successfully",
            data: investorProfile
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export {
    createInvestorProfile, getMyInvestorProfile, updateInvestorProfile
};