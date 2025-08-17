export default function TermsOfUse() {
    return (
        <div className="w-dvw h-dvh overflow-y-scroll p-[24px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b-2 border-blue-500 pb-3">
                이용약관
            </h2>

            <ol className="space-y-6 text-gray-700 leading-relaxed">
                <li className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            1
                        </span>
                        <div>
                            <p className="font-semibold text-gray-800 mb-3">
                                입력한 개인정보는 다음 목적에 활용됩니다:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                    참가자 확인
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                    상금 지급
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                    이벤트 진행을 위한 활용
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                    당사 홈페이지 사용자 통계
                                </li>
                            </ul>
                        </div>
                    </div>
                </li>

                <li className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            2
                        </span>
                        <p className="text-gray-800">
                            실시간 TOP 10에 진입할 경우 본인의 이름이 홈페이지에
                            노출됩니다
                        </p>
                    </div>
                </li>

                <li className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            3
                        </span>
                        <div className="text-gray-800">
                            <p className="mb-2">
                                참가 기회는 1인당 1회씩만 제공되며, 일주일마다
                                초기화되어 새롭게 도전 가능합니다.
                            </p>
                            <p className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                <strong>추가 기회:</strong> 친구를 초대하거나
                                광고를 시청하면 최대 6회의 도전 기회를 추가로
                                얻을 수 있습니다.
                            </p>
                        </div>
                    </div>
                </li>

                <li className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            4
                        </span>
                        <div className="text-gray-800">
                            <p className="mb-2">
                                상금은{" "}
                                <span className="font-bold text-purple-600 text-lg">
                                    100,000원(금일십만원)
                                </span>
                                이며, 시즌이 종료될 때 1위를 달성한 참가자에게
                                지급됩니다.
                            </p>
                            <p className="text-sm text-gray-600">
                                동일한 횟수로 승리한 참가자가 있을 경우 먼저
                                점수를 낸 1인에게 우선 순위가 적용됩니다.
                            </p>
                        </div>
                    </div>
                </li>

                <li className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            5
                        </span>
                        <p className="text-gray-800">
                            <span className="font-semibold text-red-600">
                                부정행위
                            </span>
                            (예: 해킹, 승부 조작, 대리 참가 등)가 확인되면 주최
                            측은 상금 취소 및 손해배상 청구를 할 수 있습니다.
                        </p>
                    </div>
                </li>

                <li className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            6
                        </span>
                        <p className="text-gray-800">
                            개인정보 오기입 시 발생하는 불이익은 참가자 본인의
                            책임입니다.
                        </p>
                    </div>
                </li>

                <li className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            7
                        </span>
                        <p className="text-gray-800">
                            &apos;
                            <span className="font-semibold text-indigo-600">
                                확인하기
                            </span>
                            &apos; 버튼을 클릭하면 자동으로 참가가 인정되며,
                            도중에 나가거나 전원을 끄는 등의 이탈 시 재참여
                            불가합니다.
                        </p>
                    </div>
                </li>

                <li className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-500 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">
                            8
                        </span>
                        <p className="text-gray-800 font-medium">
                            &apos;
                            <span className="font-semibold text-gray-700">
                                확인하기
                            </span>
                            &apos; 버튼을 클릭하면 위 모든 약관에 동의한 것으로
                            간주됩니다
                        </p>
                    </div>
                </li>
            </ol>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                    <span className="font-semibold">📋 중요사항:</span>
                    참가 전 모든 약관을 반드시 확인해주세요.
                </p>
            </div>
        </div>
    );
}
