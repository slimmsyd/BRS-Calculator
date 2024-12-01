'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserResponses, initialUserResponses, MilitaryBranch, RetirementSystem } from '../types/UserResponses';

type Step = 'intro' | 'branch-selection' | 'entry-date' | 'rank' | 'retirement-system' | 
           'service-years' | 'tsp' | 'tsp-amount' | 'lump-sum' | 'summary';

// Add animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0
  },
  exit: {
    opacity: 0,
    x: 20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [responses, setResponses] = useState<UserResponses>(initialUserResponses);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationResults, setCalculationResults] = useState<{
    monthlyPay: number;
    yearlyPay: number;
    percentageOfBasePay: string;
    lumpSum?: number;
  } | null>(null);

  const branches = ['Airforce', 'Army', 'Marines', 'Navy', 'Coast Guard', 'Space Force'];
  const ranks = [
    'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
    'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
    'W-1', 'W-2', 'W-3', 'W-4', 'W-5'
  ];

  const retirementSystems: RetirementSystem[] = ['Final Pay', 'High-3', 'BRS'];

  const goBack = () => {
    const stepOrder: Step[] = [
      'intro', 'branch-selection', 'entry-date', 'rank', 
      'retirement-system', 'service-years', 'tsp', 'tsp-amount', 'lump-sum', 'summary'
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  useEffect(() => {
    console.log("Current step: ", currentStep);
    if (currentStep === 'summary') {
      calculateRetirement(responses);
    }
  }, [currentStep, responses]);

  const handleBranchSelect = (branch: MilitaryBranch) => {
    setResponses(prev => ({ ...prev, branch }));
    setCurrentStep('entry-date');
  };

  useEffect(() => {
  }, [responses]);

  const calculateRetirement = async (responses: UserResponses) => {
    setIsCalculating(true);
    try {
      console.log('Starting retirement calculation with responses:', responses);
      
      if (responses.serviceType === 'Active Duty' && responses.yearsOfService) {
        const multiplier = 0.02;
        const yearsServed = responses.yearsOfService;
        const basePay = getRankBasePay(responses.rankPayGrade);
        
        console.log('Calculation parameters:', {
          multiplier,
          yearsServed,
          basePay,
          rankPayGrade: responses.rankPayGrade
        });

        if (!basePay) {
          console.error('Invalid base pay amount:', basePay);
          throw new Error('Base pay calculation failed');
        }

        const monthlyRetirement = basePay * multiplier * yearsServed;
        console.log('Calculated monthly retirement:', monthlyRetirement);
        
        let lumpSum: number | undefined;
        if (responses.lumpSum) {
          console.log('Calculating lump sum with percentage:', responses.lumpSumPercentage);
          const monthsRemaining = (responses.lifeExpectancy || 85) * 12;
          const totalValue = monthlyRetirement * monthsRemaining;
          lumpSum = totalValue * (responses.lumpSumPercentage === 50 ? 0.5 : 0.25);
          console.log('Calculated lump sum:', lumpSum);
        }

        const results = {
          monthlyPay: monthlyRetirement,
          yearlyPay: monthlyRetirement * 12,
          percentageOfBasePay: (multiplier * yearsServed * 100).toFixed(1) + '%',
          lumpSum
        };
        console.log('Setting final calculation results:', results);

        setCalculationResults(results);
      } else {
        console.warn('Invalid service type or years:', {
          serviceType: responses.serviceType,
          yearsOfService: responses.yearsOfService
        });
      }
    } catch (error) {
      console.error('Calculation failed:', error);
      console.error('Error details:', {
        responses,
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      console.log('Calculation process completed');
      setIsCalculating(false);
    }
  };

  // Helper function to get base pay (simplified example)
  const getRankBasePay = (rank: string | null) => {
    const basePayTable: Record<string, number> = {
      'E-1': 1733.10,
      'E-2': 1942.50,
      'E-3': 2043.30,
      'E-4': 2263.50,
      'E-5': 2468.40,
      'E-6': 2694.30,
      'E-7': 3114.30,
      'E-8': 4480.20,
      'E-9': 5473.80,
      'O-1': 3477.30,
      'O-2': 4006.50,
      'O-3': 4636.50,
      'O-4': 5671.50,
      'O-5': 6564.30,
      'O-6': 7872.30,
      'O-7': 10083.30,
      'O-8': 12185.70,
      'O-9': 15078.60,
      'O-10': 16608.30,
      'W-1': 3213.30,
      'W-2': 3661.50,
      'W-3': 4135.50,
      'W-4': 4524.30,
      'W-5': 5429.70
    };
    
    return rank ? basePayTable[rank] || 0 : 0;
  };

  const resetForm = () => {
    setResponses(initialUserResponses);
    setCalculationResults(null);
    setCurrentStep('intro');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'branch-selection':
        return (
          <motion.div
            key="branch-selection"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-3xl"
          >
            {(currentStep as string) !== 'intro' && (
              <button
                onClick={goBack}
                className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <span>←</span> Back
              </button>
            )}
            <h2 className="text-2xl font-semibold text-center mb-8">
              Your Branch Of Service
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 md:gap-6 text-black">
              {branches.map((branch) => (
                <div
                  key={branch}
                  onClick={() => handleBranchSelect(branch as MilitaryBranch)}
                  className="aspect-[3/4] bg-white rounded-xl shadow-lg p-4 flex items-center justify-center hover:shadow-xl transition-shadow cursor-pointer border text-center"
                >
                  <span className="text-base md:text-lg">{branch}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'entry-date':
        return (
          <motion.div
            key="entry-date"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-xl"
          >
            {(currentStep as string) !== 'intro' && (
              <button
                onClick={goBack}
                className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <span>←</span> Back
              </button>
            )}
            <h2 className="text-2xl font-semibold text-center mb-8 text-black">
              When did you enter the military?
            </h2>
            <input
              type="date"
              className="w-full px-4 py-3 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onChange={(e) => {
                setResponses(prev => ({ ...prev, entryDate: new Date(e.target.value) }));
              }}
            />
            <button
              onClick={() => setCurrentStep('rank')}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        );

      case 'rank':
        return (
          <motion.div
            className="w-full max-w-xl transition-all duration-500 ease-in-out transform"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold text-center mb-8 text-black">
              What is your rank/pay grade?
            </h2>
            <div className="grid grid-cols-4 gap-4 text-black">
              {ranks.map((rank) => (
                <button
                  key={rank}
                  onClick={() => {
                    setResponses(prev => ({ ...prev, rankPayGrade: rank }));
                    setCurrentStep('retirement-system');
                  }}
                  className="px-4 py-3 bg-white border rounded-lg hover:bg-gray-50 
                           transition-colors shadow-sm hover:shadow"
                >
                  {rank}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'retirement-system':
        return (
          <motion.div
            className="w-full max-w-xl transition-all duration-500 ease-in-out transform"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold text-center mb-8 text-black">
              Select your retirement system
            </h2>
            <div className="space-y-4 text-black">
              {retirementSystems.map((system) => (
                <button
                  key={system}
                  onClick={() => {
                    setResponses(prev => ({ ...prev, retirementSystem: system }));
                    setCurrentStep('service-years');
                  }}
                  className="w-full px-6 py-4 bg-white border rounded-lg text-black hover:bg-gray-50 
                           transition-colors shadow-sm hover:shadow text-left"
                >
                  <div className="font-semibold">{system}</div>
                  <div className="text-sm text-black">
                    {system === 'BRS' ? 'Blended Retirement System' : 
                     system === 'High-3' ? 'Average of highest 3 years' : 'Legacy system'}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'service-years':
        return (
          <motion.div
            className="w-full max-w-xl transition-all duration-500 ease-in-out transform"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold text-center mb-8 text-black">
              Years of Service
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Service Type
                </label>
                <div className="grid grid-cols-2 gap-4 text-black">
                  {['Active Duty', 'Reserves'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setResponses(prev => ({ 
                        ...prev, 
                        serviceType: type as 'Active Duty' | 'Reserves'
                      }))}
                      className={`px-4 py-3 border rounded-lg transition-colors
                                ${responses.serviceType === type ? 
                                'bg-blue-50 border-blue-500' : 
                                'bg-white hover:bg-gray-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {responses.serviceType === 'Active Duty' ? (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Years of Service
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    className="w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={responses.yearsOfService || ''}
                    onChange={(e) => {
                      const years = parseInt(e.target.value);
                      if (!isNaN(years)) {
                        setResponses(prev => ({ ...prev, yearsOfService: years }));
                      }
                    }}
                  />
                  {responses.yearsOfService !== null && (
                    <button
                      onClick={() => setCurrentStep('tsp')}
                      className="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg 
                               hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Total Retirement Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 text-black py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={responses.retirementPoints || ''}
                    onChange={(e) => {
                      const points = parseInt(e.target.value);
                      if (!isNaN(points)) {
                        setResponses(prev => ({ ...prev, retirementPoints: points }));
                      }
                    }}
                  />
                  {responses.retirementPoints !== null && (
                    <button
                      onClick={() => setCurrentStep('tsp')}
                      className="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg 
                               hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'tsp':
        return (
          <motion.div
            className="w-full max-w-xl transition-all duration-500 ease-in-out transform"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold text-center mb-8 text-black">
              Thrift Savings Plan (TSP)
            </h2>
            <div className="space-y-4">
              <p className=" text-center mb-6 text-black">
                Would you like to include TSP calculations in your retirement planning?
              </p>
              <div className="grid grid-cols-2 gap-4 text-black">
                <button
                  onClick={() => {
                    setResponses(prev => ({ ...prev, includeTSP: true }));
                    setCurrentStep('tsp-amount');
                  }}
                  className="px-6 py-4 bg-white border rounded-lg hover:bg-gray-50 
                           transition-colors shadow-sm hover:shadow"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setResponses(prev => ({ ...prev, includeTSP: false }));
                    setCurrentStep('lump-sum');
                  }}
                  className="px-6 py-4 bg-white border rounded-lg hover:bg-gray-50 
                           transition-colors shadow-sm hover:shadow"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'lump-sum':
        return (
          <motion.div
            className="w-full max-w-xl transition-all duration-500 ease-in-out transform"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold text-center mb-8 text-black">
              Lump Sum Option
            </h2>
            <div className="space-y-6">
              <p className="text-center mb-6 text-black">
                Would you like to receive a portion of your retirement as a lump sum payment?
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setResponses(prev => ({ ...prev, lumpSum: false }));
                    setCurrentStep('summary');
                  }}
                  className="w-full px-6 py-4 bg-white border rounded-lg hover:bg-gray-50 
                           transition-colors shadow-sm hover:shadow text-black"
                >
                  No, I prefer full monthly payments
                </button>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setResponses(prev => ({ 
                        ...prev, 
                        lumpSum: true,
                        lumpSumPercentage: 25
                      }));
                      setCurrentStep('summary');
                    }}
                    className="w-full px-6 py-4 bg-white border rounded-lg hover:bg-gray-50 
                             transition-colors shadow-sm hover:shadow text-black"
                  >
                    Yes, 25% lump sum
                  </button>
                  
                  <button
                    onClick={() => {
                      setResponses(prev => ({ 
                        ...prev, 
                        lumpSum: true,
                        lumpSumPercentage: 50
                      }));
                      setCurrentStep('summary');
                    }}
                    className="w-full px-6 py-4 bg-white border rounded-lg hover:bg-gray-50 
                             transition-colors shadow-sm hover:shadow text-black"
                  >
                    Yes, 50% lump sum
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'summary':
        return (
          <motion.div
            key="summary"
            className="w-full max-w-xl bg-white p-6 rounded-lg shadow-lg transition-all duration-500 ease-in-out transform"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold mb-6 text-black">Your Retirement Summary</h2>
            
            {isCalculating ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                <p>Calculating your benefits...</p>
              </div>
            ) : calculationResults ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 text-black rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Monthly Retirement Pay</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    ${calculationResults.monthlyPay.toFixed(2)}
                  </p>
                </div>
                
                {calculationResults.lumpSum && (
                  <div className="p-4 bg-gray-50 text-black rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Lump Sum Payment</h3>
                    <p className="text-3xl font-bold text-green-600">
                      ${calculationResults.lumpSum.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {responses.lumpSumPercentage}% of total retirement value
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-black">
                    <h3 className="font-medium">Years of Service</h3>
                    <p className="text-xl font-semibold">{responses.yearsOfService} years</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-black">
                    <h3 className="font-medium">Retirement System</h3>
                    <p className="text-xl font-semibold">{responses.retirementSystem}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={goBack}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg 
                             hover:bg-blue-600 transition-colors"
                  >
                    Go Back
                  </button>
                  
                  <button
                    onClick={resetForm}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg 
                             hover:bg-green-600 transition-colors"
                  >
                    Begin Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Unable to calculate retirement benefits</p>
              </div>
            )}
          </motion.div>
        );
    }
  };

  useEffect(() => {
    console.log(responses);
  }, [responses]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white flex-col py-12 px-4">
      <h1 className="text-4xl font-bold mb-4 text-black text-center">
        Simplify Your Military Retirement Planning
      </h1>
      <p className="text-gray-600 mb-8">
        Easily calculate your funds in minutes, think ahead.
      </p>
      <AnimatePresence mode="wait">
        {currentStep === 'intro' ? (
          <motion.div
            key="intro"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4">
              <input
                type="text"
                placeholder="Have your details ready"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => setCurrentStep('branch-selection')}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Start
              </button>
            </div>
          </motion.div>
        ) : (
          renderStepContent()
        )}
      </AnimatePresence>
    </div>
  );
} 