import React from "react";
import { Button } from "@/components/ui/button";
import { FaTimes } from "react-icons/fa";

type SectionInfo = {
    sectionTitle: string;
    questionCount: number;
};


type ModalProps = {
    invisible: boolean;
    closeModal: () => void;
};

type FullModalProps = ModalProps & {
    userAnswers: Record<number, string>;
    sectionInfo: SectionInfo[];
};

export default function Modal({
    invisible,
    closeModal,
    userAnswers,
    sectionInfo,
}: FullModalProps) {
    if (!invisible) return null;

    const totalQuestions =
        sectionInfo?.reduce(
            (sum: number, section: SectionInfo) => sum + section.questionCount,
            0
        ) || 0;

    const questionNumbers = Array.from(
        { length: totalQuestions },
        (_, i) => i + 1
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center overflow-y-auto z-10 custom-scrollbar">
            <div className="flex flex-col bg-white my-auto rounded-3xl px-6 md:px-14 py-5 w-[90%] max-w-[1000px] max-h-[90vh] overflow-y-auto animate-slide-down relative">
                {/* Close icon */}
                <button
                    className="text-customBlue absolute top-5 right-6"
                    onClick={closeModal}
                >
                    <FaTimes size={30} />
                </button>

                {/* Title */}
                <div className="text-customBlue text-2xl md:text-3xl text-center font-semibold">
                    Review your answers
                </div>
                <div className="text-customeBlack text-sm text-center mt-2 mb-4">
                    * This window is to review your answers only, you cannot change the
                    answers in here
                </div>

                {/* Answer Table */}
                <div className="w-full overflow-x-auto">
                    <table className="table-auto border-collapse border border-gray-300 w-full text-left">
                        <tbody>
                            {Array.from(
                                { length: Math.ceil(totalQuestions / 4) },
                                (_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {questionNumbers
                                            .slice(rowIndex * 4, rowIndex * 4 + 4)
                                            .map((qNum) => (
                                                <td
                                                    key={qNum}
                                                    className="border p-4 text-customBlue font-extralight text-sm"
                                                >
                                                    <span className="font-semibold">Q{qNum}:</span>{" "}
                                                    {userAnswers[qNum]}
                                                </td>
                                            ))}
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Close Button */}
                <Button
                    className="bg-customebrightBlue text-customWhite rounded-full w-48 h-10 text-lg mx-auto mt-6"
                    onClick={closeModal}
                >
                    Close
                </Button>
            </div>
        </div>
    );
}
