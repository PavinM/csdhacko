/**
 * Sample Test Data for Placement Feedback Summarizer
 * 
 * This script generates realistic sample feedback data for testing.
 * Run this in MongoDB shell or using mongoimport.
 */

const sampleFeedback = [
    {
        company: "TechCorp Solutions",
        role: "Software Development Engineer",
        rounds: [
            {
                type: "Aptitude",
                difficulty: "Moderate",
                mode: "Online",
                questions: "Quantitative aptitude covering profit & loss, time & work, data interpretation. Logical reasoning with patterns and coding-decoding. Verbal ability with reading comprehension.",
                resources: "IndiaBix, Prepinsta, R.S. Aggarwal"
            },
            {
                type: "Coding",
                difficulty: "Difficult",
                mode: "Online",
                questions: "Two problems: 1) Find longest substring without repeating characters 2) Implement LRU cache with O(1) operations",
                resources: "LeetCode Medium/Hard problems, GeeksforGeeks"
            },
            {
                type: "Technical",
                difficulty: "Moderate",
                mode: "Offline",
                questions: "OOP concepts with real-world examples, DBMS normalization and indexing, OS process scheduling, detailed discussion on final year project architecture",
                resources: "Resume projects, GFG interview prep, DBMS tutorialspoint"
            },
            {
                type: "HR",
                difficulty: "Easy",
                mode: "Offline",
                questions: "Tell me about yourself, strengths and weaknesses, why TechCorp, where do you see yourself in 5 years, salary expectations",
                resources: "Mock HR interviews, YouTube preparation videos"
            }
        ],
        overallExperience: "The interview process was well-organized and professional. The coding round was challenging but the problems were fair and tested DSA fundamentals. Technical interviewers were supportive and gave hints when stuck. Overall a positive experience.",
        rating: 4,
        tipsForJuniors: "Practice DSA problems daily on LeetCode, especially medium difficulty. Be very thorough with your resume projects - they will ask deep questions. Time management is crucial in coding rounds. Stay calm and think out loud during technical discussions.",
        createdAt: new Date("2026-01-15")
    },
    {
        company: "TechCorp Solutions",
        role: "Software Development Engineer",
        rounds: [
            {
                type: "Aptitude",
                difficulty: "Easy",
                mode: "Online",
                questions: "Basic quantitative and logical reasoning questions",
                resources: "Prepinsta"
            },
            {
                type: "Coding",
                difficulty: "Moderate",
                mode: "Online",
                questions: "Array manipulation problem and a tree traversal question",
                resources: "LeetCode, HackerRank"
            },
            {
                type: "Technical",
                difficulty: "Difficult",
                mode: "Online",
                questions: "System design for a URL shortener, concurrency in Java, microservices architecture",
                resources: "System Design Primer, YouTube channels"
            },
            {
                type: "HR",
                difficulty: "Easy",
                mode: "Online",
                questions: "Standard HR questions about background and interest in company",
                resources: "Practice with peers"
            }
        ],
        overallExperience: "Good experience overall. The system design round was tough but learned a lot. Interviewers were friendly and the process was transparent.",
        rating: 4,
        tipsForJuniors: "Don't skip system design preparation even for fresher roles. Practice explaining your thought process clearly. Prepare multiple examples for behavioral questions.",
        createdAt: new Date("2026-01-16")
    },
    {
        company: "TechCorp Solutions",
        role: "Software Development Engineer",
        rounds: [
            {
                type: "Aptitude",
                difficulty: "Moderate",
                mode: "Online",
                questions: "Quantitative aptitude and logical reasoning with time pressure",
                resources: "IndiaBix"
            },
            {
                type: "Coding",
                difficulty: "Difficult",
                mode: "Online",
                questions: "Dynamic programming problem on maximum profit scheduling, graph problem on shortest path with constraints",
                resources: "LeetCode premium, Codeforces"
            },
            {
                type: "Technical",
                difficulty: "Moderate",
                mode: "Offline",
                questions: "Deep dive into Java collections framework, SQL query optimization, REST API design principles",
                resources: "Effective Java book, database indexing tutorials"
            }
        ],
        overallExperience: "Challenging but fair interview process. The coding round required strong problem-solving skills. Time management was crucial.",
        rating: 3,
        tipsForJuniors: "Build strong fundamentals in DSA. Practice timed coding sessions. Understand trade-offs in system design decisions.",
        createdAt: new Date("2026-01-17")
    },
    {
        company: "InnovateTech",
        role: "Full Stack Developer",
        rounds: [
            {
                type: "Coding",
                difficulty: "Moderate",
                mode: "Online",
                questions: "Two coding problems: binary search variation and stack-based problem",
                resources: "GeeksforGeeks, LeetCode"
            },
            {
                type: "Technical",
                difficulty: "Moderate",
                mode: "Offline",
                questions: "React component lifecycle, Node.js event loop, MongoDB aggregation pipelines, project discussion",
                resources: "Official documentation, full stack tutorials"
            },
            {
                type: "HR",
                difficulty: "Easy",
                mode: "Offline",
                questions: "Why full stack development, team collaboration experiences, relocation willingness",
                resources: "Mock interviews"
            }
        ],
        overallExperience: "Very friendly interviewers who focused on understanding how you think. The technical round was more conversational than interrogative. Positive experience.",
        rating: 5,
        tipsForJuniors: "If applying for full stack, be equally strong in both frontend and backend. Build complete projects to demonstrate end-to-end understanding. Communication skills matter a lot.",
        createdAt: new Date("2026-01-20")
    },
    {
        company: "DataSystems Inc",
        role: "Data Analyst",
        rounds: [
            {
                type: "Aptitude",
                difficulty: "Easy",
                mode: "Online",
                questions: "Focus on data interpretation and basic statistics",
                resources: "Quantitative aptitude books"
            },
            {
                type: "Technical",
                difficulty: "Moderate",
                mode: "Online",
                questions: "SQL queries on complex joins and aggregations, Python pandas questions, basic ML concepts",
                resources: "SQL practice websites, Kaggle tutorials"
            },
            {
                type: "Case Study",
                difficulty: "Difficult",
                mode: "Offline",
                questions: "Given sales data, identify trends and present insights with visualizations",
                resources: "Case study practice, Tableau/PowerBI tutorials"
            }
        ],
        overallExperience: "The case study round was challenging but interesting. They valued analytical thinking over rote knowledge. Overall a good learning experience.",
        rating: 4,
        tipsForJuniors: "Practice SQL extensively. Learn data visualization tools. Be ready to explain your analytical approach step-by-step. Business acumen helps.",
        createdAt: new Date("2026-01-22")
    }
];

// MongoDB shell commands to insert this data:
// use kec_placement_portal
// db.feedbacks.insertMany(<paste the sampleFeedback array here>)

export default sampleFeedback;
