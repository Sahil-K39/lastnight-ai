import { StudyKit, PredictionData } from "./types";

export const initialStudyKits: StudyKit[] = [
  {
    id: "kit-ds",
    courseName: "Data Structures",
    code: "CS-201",
    term: "Midterm Prep",
    timestamp: "2 days ago",
    progress: 65,
    data: {
      courseName: "Data Structures & Algorithms",
      description: "Exam Prep Kit compiled by LastNight AI. Based on CS-201 Syllabus & 3 years of past papers.",
      confidence: "Very High",
      accuracy: "High AI confidence estimate",
      examStrategy: "If your exam is tomorrow, DO NOT try to memorize every sorting algorithm. Focus 100% on Balanced Trees (specifically AVL and Red-Black properties) and Graph Algorithms (Dijkstra vs Bellman-Ford). These two sections are the safest high-yield path based on common exam patterns.",
      highPriorityTopics: [
        {
          id: "t-ds-1",
          topic: "Balanced Search Trees",
          importance: "Critical",
          reason: "AVL self-balancing math and Red-Black coloring rule proofs are standard in Section B of the exam.",
          subtopics: ["AVL rotations", "Red-Black tree properties", "Height bounds"]
        },
        {
          id: "t-ds-2",
          topic: "Hash Map Collisions",
          importance: "High",
          reason: "Quadratic vs Lin Probings always come up as 10-mark numeric calculations.",
          subtopics: ["Quadratic Probing equation", "Load Factor thresholds", "Chaining vs Open Addressing"]
        },
        {
          id: "t-ds-3",
          topic: "Shortest Path Graphing",
          importance: "High",
          reason: "Examiners love asking why Dijkstra fail on negative weights.",
          subtopics: ["Dijkstra proof", "Bellman-Ford detection", "Min-heap priority queues"]
        }
      ],
      questions: [
        {
          id: "q-ds-1",
          question: "Detailed comparison of AVL Trees vs Red-Black Trees. Analyze the insertion complexity and maximum height bounds of both.",
          likelihood: "High",
          percentage: 94,
          marks: "15 Marks",
          explanation: "AVL Trees are more strictly balanced: height factor difference is at most 1, leading to faster lookups but potentially more rotations on inserts/deletes. Red-Black trees are loosely balanced (longest path is at most twice the shortest path), requiring fewer rotations on inserts/deletes, making them optimal for general map/set implementations (such as std::map in C++). Height of AVL is restricted to 1.44 log N, Red-Black is restricted to 2 log N.",
          tags: ["Balanced Trees", "Complexity Analysis"]
        },
        {
          id: "q-ds-2",
          question: "Design and implement a Hash Map that handles collisions using Quadratic Probing and state-by-state resizing criteria.",
          likelihood: "High",
          percentage: 86,
          marks: "10 Marks",
          explanation: "Quadratic Probing avoids primary clustering by choosing slots via (hash(k) + c1*i + c2*i^2) % table_size. Be ready to explain load factor criteria (usually threshold = 0.7 or 0.5) and why table size should be a prime number. Resizing copies existing values to a new bucket system with a prime size roughly double the previous size.",
          tags: ["Hashing", "Collision Resolution"]
        },
        {
          id: "q-ds-3",
          question: "Prove why Dijkstra's algorithm fails with negative edge weights and compare its complexity with Bellman-Ford.",
          likelihood: "Medium",
          percentage: 72,
          marks: "15 Marks",
          explanation: "Dijkstra is a greedy algorithm assuming that once a node is visited, its shortest path is finalized. Negative edge weights can yield shorter paths later which Dijkstra will never re-evaluate. Bellman-Ford checks all edges repeatedly (V-1 times) so it handles negative edges correctly and detects negative cycles.",
          tags: ["Graph Algorithms", "Network Optimization"]
        }
      ],
      quickRevisionNotes: [
        {
          id: "rn-ds-1",
          title: "AVL Trees: Self-Balancing Rule",
          summary: "AVL maintains safe binary search trees with guaranteed O(log n) lookups. On every insert/delete, balance factor is recalculated.",
          keyPoints: [
            "Balance Factor (BF) = Height(LeftSubtree) - Height(RightSubtree).",
            "Must be in set {-1, 0, 1}. Violation triggers rotations.",
            "Single Rotation: LL (Right-Rotate on violator) or RR (Left-Rotate).",
            "Double Rotation: LR (Left-Rotate child, then Right-Rotate parent) or RL."
          ]
        },
        {
          id: "rn-ds-2",
          title: "Dijkstra Failures & Bellman-Ford",
          summary: "Greedy choice in Dijkstra causes it to overlook paths that are unlocked later via negative-weight bypasses.",
          keyPoints: [
            "Dijkstra assumes distances in the priority queue can only grow or maintain.",
            "Bellman-Ford relaxes all edges |V| - 1 times.",
            "If another relaxation on the |V|-th iteration changes distances, a negative-weight cycle exists."
          ]
        }
      ],
      vivaQuestions: [
        {
          id: "vq-ds-1",
          question: "Why do standard libraries use Red-Back trees over AVL?",
          answer: "Because AVL trees are more strictly balanced, they involve significantly more rotations during modifications. Standard libraries tend to involve high volumes of additions and removals, making Red-Black Trees (which rebalance in fewer operations) faster overall.",
          examinerAngle: "Focus on rebalancing overhead rather than search speeds."
        },
        {
          id: "vq-ds-2",
          question: "What is primary vs secondary clustering in Hash Tables?",
          answer: "Primary clustering occurs in Linear Probing where elements clump together in local contiguous blocks, dragging down search times. Secondary clustering occurs when elements with identical initial hashes follow identical probe sequences, typically seen in Quadratic Probing.",
          examinerAngle: "Expects you to name the probe equations."
        }
      ],
      quiz: [
        {
          id: "qz-ds-1",
          question: "What is the maximum height of an AVL tree with 'N' nodes?",
          options: ["~ 1.44 log2(N)", "~ 2.0 log2(N)", "~ 1.0 log2(N)", "~ N / 2"],
          correctAnswerIndex: 0,
          explanation: "AVL Trees are strictly balanced and bound by height h < 1.4404 log2(N + 2) - 0.3277."
        },
        {
          id: "qz-ds-2",
          question: "Which hash probing method completely avoids primary clustering but can suffer from secondary clustering?",
          options: ["Linear Probing", "Chaining", "Quadratic Probing", "Double Hashing"],
          correctAnswerIndex: 2,
          explanation: "Quadratic Probing avoids contiguous clustering blocks (primary) because of its non-linear step index, but can still lead to identical probe sequences (secondary)."
        }
      ],
      summary: "This Data Structures exam is highly schematic and mathematical. Ensure you double-check height calculation proofs and tree rotation formulas. For Graph sections, be prepared to outline negative weight matrices and run-times on scratchpad sheets.",
      studyPlan: [
        {
          id: "p-ds-1",
          time: "07:30 PM - Trees & Balanced Trees",
          task: "Practice tree rotations.",
          detail: "Review Single Left, Single Right, and Double rotations (Left-Right, Right-Left) for AVL tree insertion scenarios.",
          active: true
        },
        {
          id: "p-ds-2",
          time: "10:00 PM - Graph Algorithms Triage",
          task: "Perform Dijkstra vs BFS.",
          detail: "Review implementing Dijkstra using a Priority Queue / Min-Heap. Confirm bounds O((V+E) log V).",
          active: false
        },
        {
          id: "p-ds-3",
          time: "12:30 AM - Dynamic Programming basics",
          task: "Knapsack and LCS.",
          detail: "Work out state transitions for 0/1 Knapsack. Write down the recurrence relation matrix on paper to memorize state transition dependencies.",
          active: false
        }
      ],
      heatmapTags: ["AVL Trees", "Red-Black Trees", "Dijkstra", "Quadratic Probing", "Hash Collision", "Dynamic Programming", "Heap Sort", "BFS/DFS"]
    }
  },
  {
    id: "kit-os",
    courseName: "Operating Systems",
    code: "CS-304",
    term: "Final Review",
    timestamp: "5 days ago",
    progress: 40,
    data: {
      courseName: "System Architecture & Operating Systems",
      description: "Exam Prep Kit compiled by LastNight AI. Based on CS-304 Syllabus & 5 years of PYQ trends.",
      confidence: "High",
      accuracy: "High AI confidence estimate",
      examStrategy: "Paging algorithms and Deadlock conditions represent 50% of the numerical questions. Study the Banker's Algorithm safety check thoroughly. You are highly likely to get an 8-to-12 mark problem asking you to prove if a process graph is deadlocked.",
      highPriorityTopics: [
        {
          id: "t-os-1",
          topic: "Deadlock Prevention & Avoidance",
          importance: "Critical",
          reason: "Banker's Algorithm safety checking is a guaranteed 12-mark exam problem historically.",
          subtopics: ["Mutual exclusion", "Hold & wait", "Banker's calculation", "Resource matrices"]
        },
        {
          id: "t-os-2",
          topic: "Virtual Memory & Paging",
          importance: "High",
          reason: "Page replacement simulations (LRU vs FIFO vs Optimal) is another highly recurring numeric.",
          subtopics: ["Page offsets", "LRU/FIFO frames", "Belady's anomaly"]
        },
        {
          id: "t-os-3",
          topic: "Kernel vs User Threads",
          importance: "Medium",
          reason: "Short conceptual comparison under the multi-threading chapter.",
          subtopics: ["1-to-1 mapping", "Many-to-many schedules", "Context switching overheads"]
        }
      ],
      questions: [
        {
          id: "q-os-1",
          question: "Explain the four necessary conditions for Deadlock occurrence and outline prevention vs avoidance strategies.",
          likelihood: "High",
          percentage: 95,
          marks: "15 Marks",
          explanation: "The four conditions are: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption, and (4) Circular Wait. Prevention eliminates one of these design patterns structurally. Avoidance dynamically checks resource status using algorithms like Dijkstra's Banker's Algorithm to verify safety.",
          tags: ["Deadlocks", "Process Sync"]
        },
        {
          id: "q-os-2",
          question: "Explain the virtual memory paging system, analyzing Internal vs External fragmentation and Page Replacement Algorithms.",
          likelihood: "High",
          percentage: 89,
          marks: "12 Marks",
          explanation: "Paging divides memory into fixed-size physical frames, eliminating external fragmentation completely. However, internal fragmentation can occur if requested allocation is not a multiple of page size. Study FIFO, LRU, and Optimal Replacement (Belady's Anomaly proof).",
          tags: ["Virtual Memory", "Operating Systems"]
        },
        {
          id: "q-os-3",
          question: "Analyze the difference between User Threads and Kernel Threads. Sketch user space vs kernel space maps.",
          likelihood: "Medium",
          percentage: 67,
          marks: "8 Marks",
          explanation: "User Threads are managed completely in user space without kernel awareness, making thread creation extremely fast but mapping blocked system calls to blocking the entire process. Kernel Threads are scheduled directly by the OS, meaning multi-core systems can run thread instances in true parallel.",
          tags: ["Multithreading", "Scheduling"]
        }
      ],
      quickRevisionNotes: [
        {
          id: "rn-os-1",
          title: "The 4 Deadlock Conditions",
          summary: "Deadlock occurs only if all 4 conditions are met. Breaking any condition prevents deadlock.",
          keyPoints: [
            "Mutual Exclusion: Resource can be held by only one process at a time.",
            "Hold & Wait: Process holds resource while waiting for another.",
            "No Preemption: Only holding process can release the resource.",
            "Circular Wait: Process P0 waits for P1, which waits for P2... which waits for P0."
          ]
        },
        {
          id: "rn-os-2",
          title: "Belady's Anomaly (FIFO Warning)",
          summary: "Intuition suggests more page frames = fewer faults. FIFO page replacement algorithm proves this wrong.",
          keyPoints: [
            "FIFO replaces pages in chronological queued order.",
            "Belady's anomaly shows page faults can increase when page frames increase.",
            "LRU and Optimal do NOT suffer from Belady's Anomaly because they belong to Stack Algorithms."
          ]
        }
      ],
      vivaQuestions: [
        {
          id: "vq-os-1",
          question: "What is Banker's Algorithm used for specifically?",
          answer: "It is an avoidance algorithm used to determine if a state is 'safe'. It simulates allocation for maximum potential claims and verifies if there is a sequence of process executions that can complete without causing deadlocks.",
          examinerAngle: "Point out that it does not prevent Deadlocks structurally, but dynamically avoids unsafe states."
        },
        {
          id: "vq-os-2",
          question: "What happens during a Page Fault?",
          answer: "When a process references a page that isn't mapped in physical memory, the MMU triggers a Page Fault interrupt. The OS pauses the process, locates the page on disk, pulls it into an empty frame, updates the Page Table, and resumes process instruction execution.",
          examinerAngle: "Highlight the context jump from Hardware to OS Kernel interrupt handlers."
        }
      ],
      quiz: [
        {
          id: "qz-os-1",
          question: "Which paging algorithm suffers from Belady's Anomaly?",
          options: ["Least Recently Used (LRU)", "First-In-First-Out (FIFO)", "Optimal (OPT)", "Clock Page Replacement"],
          correctAnswerIndex: 1,
          explanation: "FIFO page replacement can exhibit Belady's anomaly; adding physical frames can sometimes lead to more page faults."
        },
        {
          id: "qz-os-2",
          question: "How many nested loops are executed in standard Banker's safety check for R resource types and P processes?",
          options: ["O(R)", "O(P^2 * R)", "O(P * R)", "O(P + R)"],
          correctAnswerIndex: 1,
          explanation: "The complexity of the safety algorithm is O(P^2 * R) since we might search for a process to complete up to P times, checking R resource availability on each loop."
        }
      ],
      summary: "Understand operating systems as resource managers. Memorize tables, page boundaries, and deadlock cycles. Draw thread state diagrams if there are descriptive questions on scheduling states.",
      studyPlan: [
        {
          id: "p-os-1",
          time: "08:00 PM - Deadlock & Banker's Algorithm",
          task: "Resolve resource allocation graphs.",
          detail: "Draw states, safe routes, and request matrices. Work through standard allocation verification step-by-step.",
          active: true
        },
        {
          id: "p-os-2",
          time: "10:45 PM - Paging & Page Demands",
          task: "Perform LRU vs FIFO.",
          detail: "Solve simulated memory pages request string (e.g. 7,0,1,2,0,3,0,4...) tracking physical frame faults. Confirm Belady's FIFO performance decrease.",
          active: false
        },
        {
          id: "p-os-3",
          time: "01:15 AM - CPU Schedulers Review",
          task: "Compare Priority vs RR.",
          detail: "Review preemptive Round Robin execution layouts, keeping track of ready queue shifts and average turnaround waiting times.",
          active: false
        }
      ],
      heatmapTags: ["Deadlocks", "Mutex/Semaphores", "Banker's Algorithm", "Paging", "Belady's Anomaly", "LRU/FIFO", "Round Robin", "Context Switching"]
    }
  }
];

export const defaultPrediction: PredictionData = {
  courseName: "Advanced Machine Learning",
  description: "Exam Prep Kit compiled by LastNight AI. Custom-triaged based on syllabus objectives.",
  confidence: "High",
  accuracy: "High AI confidence estimate",
  examStrategy: "The primary focus for tomorrow's examiner lies in deep representation models (CNN structures) and linear boundary models (SVM margins). If you have only 4 hours to study: 1) Master the backpropagation derivative equations; 2) Memorize differences between Support Vector kernels. Skip heavy deep learning theory for now; focus on structural draw tasks.",
  highPriorityTopics: [
    {
      id: "t-ml-1",
      topic: "Deep Representation Networks",
      importance: "Critical",
      reason: "CNN structural drawing and activation functions occupy 15-mark questions in nearly all model papers.",
      subtopics: ["Convolution stride/padding", "Max-pooling benefits", "ReLU activation"]
    },
    {
      id: "t-ml-2",
      topic: "Support Vector Machines",
      importance: "High",
      reason: "Mathematical proof of margins and kernel selection formulas standard in classification sections.",
      subtopics: ["Linearly separable margins", "Kernel trick bounds", "SVM vs Trees"]
    }
  ],
  questions: [
    {
      id: "q-1",
      question: "Explain the architecture of a Convolutional Neural Network (CNN) and describe the function of pooling layers.",
      likelihood: "High",
      percentage: 92,
      marks: "15 Marks",
      explanation: "You must explain: (1) Convolutional layers (feature extraction via kernels, stride, padding), (2) Activation functions (specifically ReLU to introduce non-linearity), and (3) Pooling layers (Max pooling vs Average pooling for spatial downsampling, translation invariance, and parameters reduction). Be prepared to draw a simple layout illustrating transition from input tensor to fully connected layer.",
      tags: ["Deep Learning", "Computer Vision"]
    },
    {
      id: "q-2",
      question: "Compare and contrast Support Vector Machines (SVM) with Decision Trees, providing clear use cases for both.",
      likelihood: "Medium",
      percentage: 75,
      marks: "10 Marks",
      explanation: "SVM maps data to high-dimensional space using kernel trick (linear, rbf, poly) to construct optimal separating hyperplanes, works well on complex, small/medium structured data. Decision Trees recursively partition feature space based on entropy/Gini index, highly interpretable but prone to overfitting without pruning. Use SVM for text/bioinformatics; use Decision Trees/Random Forests for tabular business analytics.",
      tags: ["Supervised Learning", "Classifiers"]
    }
  ],
  quickRevisionNotes: [
    {
      id: "rn-ml-1",
      title: "Convolutional Neural Networks (CNN)",
      summary: "CNNs specialize in spatial data grids. They use shared sliding filters instead of fully connected grids.",
      keyPoints: [
        "Convolution: Dot product of kernel weights across spatial blocks.",
        "Padding: Controls dimension reduction. 'Same' padding adds zero margins.",
        "Pooling: Max-pooling collects the peak activation, reducing parameters and noise.",
        "ReLU: f(x) = max(0,x) - solves vanishing gradients for deeper stacks."
      ]
    },
    {
      id: "rn-ml-2",
      title: "SVM Kernel Trick Breakdown",
      summary: "When data is linearly inseparable, map it to a higher dimension space where a linear boundary exists.",
      keyPoints: [
        "Margin: the gap between closest data coordinates (support vectors) and the split plane.",
        "RBF Kernel: evaluates infinite dimensional mappings mathematically utilizing Gaussian functions.",
        "Saves enormous cost by staying inside low-dimensional math while gaining high-dimensional splitting."
      ]
    }
  ],
  vivaQuestions: [
    {
      id: "vq-ml-1",
      question: "Why is ReLU preferred over Sigmoid in deep hidden networks?",
      answer: "Sigmoid squashes outputs into a [0, 1] range, meaning for large values, the gradient is extremely small. Layer multiplications cause early layer gradients to vanish during backpropagation. ReLU maintains constant gradient 1 for positive inputs, combating this vanishing effect.",
      examinerAngle: "Reference vanishing gradients specifically."
    },
    {
      id: "vq-ml-2",
      question: "Can an SVM handle non-linear separation patterns?",
      answer: "Yes, by utilizing the Kernel Trick (like RBF or polynomial kernels), SVM implicitly maps inputs to high-dimensional spaces without actually computing coordinates, establishing optimal separating hyperplanes there.",
      examinerAngle: "Emphasize similarity math over actual point transformation."
    }
  ],
  quiz: [
    {
      id: "qz-ml-1",
      question: "What does ReLU stand for in the context of neural activation?",
      options: ["Recurrent Linear Unit", "Rectified Linear Unit", "Regularized Latent Unit", "Rescaled Logic Unit"],
      correctAnswerIndex: 1,
      explanation: "ReLU is Rectified Linear Unit, defined mathematically as f(x) = max(0, x)."
    },
    {
      id: "qz-ml-2",
      question: "Which SVM hyperparameter controls the tradeoff between margin width and classification error penalty?",
      options: ["Alpha", "C (Regularization parameter)", "Sigma", "Gamma"],
      correctAnswerIndex: 1,
      explanation: "The C parameter controls regularization: larger C penalizes misclassifications heavily (creating tight margins), while smaller C permits minor errors to secure wider soft margins."
    }
  ],
  summary: "Machine Learning is conceptually rich but highly mathematical in grading templates. Focus your preparation on describing algorithms, drawing CNN filters, and justifying classifier selections based on sample volumes.",
  studyPlan: [
    {
      id: "p-1",
      time: "08:00 PM - CNN & RNNs",
      task: "Focus on architecture diagrams.",
      detail: "Practice sketching convolutional and pooling layers. Review LSTM memory cell pathways (forget gate, input gate, output gate) to prepare for recurrent architectures.",
      active: true
    },
    {
      id: "p-2",
      time: "10:30 PM - Optimization Algorithms",
      task: "Review SGD vs Adam.",
      detail: "Understand the math of SGD with momentum, AdaGrad, RMSprop, and how Adam balances momentum and learning rate scaling.",
      active: false
    }
  ],
  heatmapTags: ["Backpropagation", "Transformers", "Regularization", "K-Means", "PCA"]
};
