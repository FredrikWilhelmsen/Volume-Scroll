import React from "react";
import BackButton from "../components/BackButton";
import { CustomRule, Pages } from "../types";

interface CustomRulesPageProps {
    customRules?: Record<string, CustomRule[]>;
    ignoredElementsList?: Record<string, string[]>;
    updateCustomRules: (domain: string, rules: CustomRule[]) => void;
    updateIgnoredElementsList: (
        domain: string,
        ignoredElements: string[],
    ) => void;
    activeDomain?: string | null;
    setPage: (targetPage: Pages) => void;
}

const CustomRulesPage: React.FC<CustomRulesPageProps> = ({
    customRules,
    ignoredElementsList,
    updateCustomRules,
    updateIgnoredElementsList,
    activeDomain,
    setPage,
}) => {
    return (
        <div>
            <BackButton
                setPage={setPage}
                title="Custom Rules"
                targetPage="domains"
            />
            <hr />
            <div className="settingsContainer">
                {/* Custom rules settings will go here */}
            </div>
        </div>
    );
};

export default CustomRulesPage;
