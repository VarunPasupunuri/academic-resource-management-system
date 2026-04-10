import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

actor {

  // ─── Types ────────────────────────────────────────────────────────────────

  public type UserRole = { #faculty; #student };

  public type User = {
    id : Nat;
    email : Text;
    password : Text;
    name : Text;
    role : UserRole;
    createdAt : Int;
  };

  public type Resource = {
    id : Nat;
    title : Text;
    type_ : Text;
    courseId : Nat;
    url : Text;
    uploadedBy : Nat;
    createdAt : Int;
  };

  public type Course = {
    id : Nat;
    title : Text;
    description : Text;
    facultyId : Nat;
    createdAt : Int;
  };

  public type QuizQuestion = {
    text : Text;
    options : [Text];
    correctIndex : Nat;
  };

  public type Quiz = {
    id : Nat;
    title : Text;
    courseId : Nat;
    questions : [QuizQuestion];
    createdAt : Int;
  };

  public type QuizResult = {
    id : Nat;
    userId : Nat;
    quizId : Nat;
    score : Nat;
    total : Nat;
    submittedAt : Int;
  };

  public type Assignment = {
    id : Nat;
    title : Text;
    courseId : Nat;
    dueDate : Text;
    description : Text;
    createdAt : Int;
  };

  public type AssignmentSubmission = {
    id : Nat;
    userId : Nat;
    assignmentId : Nat;
    content : Text;
    submittedAt : Int;
  };

  public type Notification = {
    id : Nat;
    userId : Nat;
    message : Text;
    type_ : Text;
    isRead : Bool;
    createdAt : Int;
  };

  // ─── State ────────────────────────────────────────────────────────────────

  let users = List.empty<User>();
  var nextUserId : Nat = 1;

  let resources = List.empty<Resource>();
  var nextResourceId : Nat = 1;

  let courses = List.empty<Course>();
  var nextCourseId : Nat = 1;

  let quizzes = List.empty<Quiz>();
  var nextQuizId : Nat = 1;

  let quizResults = List.empty<QuizResult>();
  var nextQuizResultId : Nat = 1;

  let assignments = List.empty<Assignment>();
  var nextAssignmentId : Nat = 1;

  let assignmentSubmissions = List.empty<AssignmentSubmission>();
  var nextSubmissionId : Nat = 1;

  let notifications = List.empty<Notification>();
  var nextNotifId : Nat = 1;

  var seeded : Bool = false;

  // ─── Seed helpers ─────────────────────────────────────────────────────────

  func seedData() {
    if (seeded) return;
    seeded := true;

    let now = Time.now();

    // Users
    users.add({ id = 1; email = "faculty@demo.com"; password = "demo123"; name = "Dr. Smith"; role = #faculty; createdAt = now });
    users.add({ id = 2; email = "faculty2@demo.com"; password = "demo123"; name = "Prof. Johnson"; role = #faculty; createdAt = now });
    users.add({ id = 3; email = "student@demo.com"; password = "demo123"; name = "Alice Student"; role = #student; createdAt = now });
    users.add({ id = 4; email = "student2@demo.com"; password = "demo123"; name = "Bob Student"; role = #student; createdAt = now });
    nextUserId := 5;

    // Courses
    courses.add({ id = 1; title = "Mathematics"; description = "Calculus, algebra, and more"; facultyId = 1; createdAt = now });
    courses.add({ id = 2; title = "Physics"; description = "Classical mechanics and quantum theory"; facultyId = 1; createdAt = now });
    courses.add({ id = 3; title = "Computer Science"; description = "Algorithms, data structures, and programming"; facultyId = 2; createdAt = now });
    nextCourseId := 4;

    // Resources
    resources.add({ id = 1; title = "Calculus Textbook"; type_ = "pdf"; courseId = 1; url = "https://example.com/calculus.pdf"; uploadedBy = 1; createdAt = now });
    resources.add({ id = 2; title = "Algebra Notes"; type_ = "doc"; courseId = 1; url = "https://example.com/algebra.doc"; uploadedBy = 1; createdAt = now });
    resources.add({ id = 3; title = "Newton's Laws Lecture"; type_ = "video"; courseId = 2; url = "https://example.com/newton.mp4"; uploadedBy = 1; createdAt = now });
    resources.add({ id = 4; title = "Quantum Mechanics PDF"; type_ = "pdf"; courseId = 2; url = "https://example.com/quantum.pdf"; uploadedBy = 1; createdAt = now });
    resources.add({ id = 5; title = "Data Structures Slides"; type_ = "pdf"; courseId = 3; url = "https://example.com/ds.pdf"; uploadedBy = 2; createdAt = now });
    nextResourceId := 6;

    // Quizzes - Mathematics (7 questions)
    quizzes.add({
      id = 1;
      title = "Calculus Basics";
      courseId = 1;
      createdAt = now;
      questions = [
        { text = "What is the derivative of x^2?"; options = ["x", "2x", "x^2", "2"]; correctIndex = 1 },
        { text = "What is the integral of 1/x dx?"; options = ["x", "ln(x) + C", "1/x^2 + C", "x^2"]; correctIndex = 1 },
        { text = "What is the limit of sin(x)/x as x->0?"; options = ["0", "infinity", "1", "undefined"]; correctIndex = 2 },
        { text = "Which rule is used to differentiate f(g(x))?"; options = ["Product rule", "Quotient rule", "Chain rule", "Power rule"]; correctIndex = 2 },
        { text = "What is d/dx of e^x?"; options = ["e^x", "xe^(x-1)", "e", "1"]; correctIndex = 0 },
        { text = "What is the derivative of ln(x)?"; options = ["1/x^2", "x", "1/x", "ln(x)/x"]; correctIndex = 2 },
        { text = "The integral of cos(x) dx is?"; options = ["-sin(x) + C", "sin(x) + C", "tan(x) + C", "-cos(x) + C"]; correctIndex = 1 }
      ];
    });

    // Quizzes - Physics (7 questions)
    quizzes.add({
      id = 2;
      title = "Classical Mechanics";
      courseId = 2;
      createdAt = now;
      questions = [
        { text = "Newton's second law states F = ?"; options = ["mv", "ma", "m/a", "v/t"]; correctIndex = 1 },
        { text = "What is the unit of force in SI?"; options = ["Joule", "Watt", "Newton", "Pascal"]; correctIndex = 2 },
        { text = "What is the formula for kinetic energy?"; options = ["mgh", "half mv^2", "mv^2", "Fd"]; correctIndex = 1 },
        { text = "Which law states equal and opposite reactions?"; options = ["First law", "Second law", "Third law", "Zeroth law"]; correctIndex = 2 },
        { text = "What is the acceleration due to gravity (approx)?"; options = ["9.8 m/s^2", "8.9 m/s^2", "10.8 m/s^2", "11 m/s^2"]; correctIndex = 0 },
        { text = "Momentum = ?"; options = ["F*t", "m*v", "m*a", "half mv^2"]; correctIndex = 1 },
        { text = "What is the SI unit of work?"; options = ["Newton", "Joule", "Watt", "Ampere"]; correctIndex = 1 }
      ];
    });

    // Quizzes - Computer Science (7 questions)
    quizzes.add({
      id = 3;
      title = "Data Structures";
      courseId = 3;
      createdAt = now;
      questions = [
        { text = "Which data structure uses LIFO?"; options = ["Queue", "Stack", "Tree", "Graph"]; correctIndex = 1 },
        { text = "Big-O of binary search on a sorted array?"; options = ["O(n)", "O(n^2)", "O(log n)", "O(1)"]; correctIndex = 2 },
        { text = "Which structure is best for BFS?"; options = ["Stack", "Queue", "Array", "Linked List"]; correctIndex = 1 },
        { text = "A binary tree has at most how many children per node?"; options = ["1", "2", "3", "4"]; correctIndex = 1 },
        { text = "What is the time complexity of accessing an array element?"; options = ["O(log n)", "O(n)", "O(1)", "O(n^2)"]; correctIndex = 2 },
        { text = "A hash map lookup is typically?"; options = ["O(n)", "O(log n)", "O(1)", "O(n log n)"]; correctIndex = 2 },
        { text = "Which sorting algorithm has worst-case O(n log n)?"; options = ["Bubble sort", "Insertion sort", "Merge sort", "Quick sort"]; correctIndex = 2 }
      ];
    });
    nextQuizId := 4;

    // Assignments
    assignments.add({ id = 1; title = "Calculus Problem Set 1"; courseId = 1; dueDate = "2026-05-01"; description = "Solve problems 1-20 from chapter 3 on differentiation."; createdAt = now });
    assignments.add({ id = 2; title = "Physics Lab Report"; courseId = 2; dueDate = "2026-05-10"; description = "Write a lab report on the pendulum experiment."; createdAt = now });
    assignments.add({ id = 3; title = "Algorithm Analysis Essay"; courseId = 3; dueDate = "2026-05-15"; description = "Compare time complexity of sorting algorithms."; createdAt = now });
    nextAssignmentId := 4;

    // Notifications
    notifications.add({ id = 1; userId = 3; message = "Welcome to the Academic Resource System!"; type_ = "info"; isRead = false; createdAt = now });
    notifications.add({ id = 2; userId = 3; message = "New quiz available: Calculus Basics"; type_ = "quiz"; isRead = false; createdAt = now });
    notifications.add({ id = 3; userId = 4; message = "Welcome to the Academic Resource System!"; type_ = "info"; isRead = false; createdAt = now });
    nextNotifId := 4;
  };

  // Run seed on actor init
  seedData();

  // ─── User Management ──────────────────────────────────────────────────────

  public func register(email : Text, password : Text, role : UserRole, name : Text) : async { #ok : Nat; #err : Text } {
    let existing = users.find(func(u : User) : Bool { u.email == email });
    switch (existing) {
      case (?_) { #err("Email already registered") };
      case null {
        let id = nextUserId;
        nextUserId += 1;
        users.add({ id; email; password; name; role; createdAt = Time.now() });
        #ok(id)
      };
    };
  };

  public query func login(email : Text, password : Text) : async { #ok : User; #err : Text } {
    let found = users.find(func(u : User) : Bool { u.email == email and u.password == password });
    switch (found) {
      case (?u) { #ok(u) };
      case null { #err("Invalid email or password") };
    };
  };

  public query func getUser(id : Nat) : async ?User {
    users.find(func(u : User) : Bool { u.id == id })
  };

  public query func getAllUsers() : async [User] {
    users.toArray()
  };

  public query func getStudentCount() : async Nat {
    users.filter(func(u : User) : Bool { u.role == #student }).size()
  };

  // ─── Course Management ────────────────────────────────────────────────────

  public func addCourse(title : Text, description : Text, facultyId : Nat) : async Nat {
    let id = nextCourseId;
    nextCourseId += 1;
    courses.add({ id; title; description; facultyId; createdAt = Time.now() });
    id
  };

  public query func getCourses() : async [Course] {
    courses.toArray()
  };

  public query func getCourse(id : Nat) : async ?Course {
    courses.find(func(c : Course) : Bool { c.id == id })
  };

  // ─── Resource Management ──────────────────────────────────────────────────

  public func addResource(title : Text, type_ : Text, courseId : Nat, url : Text, uploadedBy : Nat) : async Nat {
    let id = nextResourceId;
    nextResourceId += 1;
    resources.add({ id; title; type_; courseId; url; uploadedBy; createdAt = Time.now() });
    id
  };

  public query func getResources() : async [Resource] {
    resources.toArray()
  };

  public query func getResourcesByCourse(courseId : Nat) : async [Resource] {
    resources.filter(func(r : Resource) : Bool { r.courseId == courseId }).toArray()
  };

  // ─── Quiz Management ──────────────────────────────────────────────────────

  public func addQuiz(title : Text, courseId : Nat, questions : [QuizQuestion]) : async Nat {
    let id = nextQuizId;
    nextQuizId += 1;
    quizzes.add({ id; title; courseId; questions; createdAt = Time.now() });
    id
  };

  public query func getQuizzes() : async [Quiz] {
    quizzes.toArray()
  };

  public query func getQuizzesByCourse(courseId : Nat) : async [Quiz] {
    quizzes.filter(func(q : Quiz) : Bool { q.courseId == courseId }).toArray()
  };

  // ─── Quiz Results ─────────────────────────────────────────────────────────

  public func submitQuizResult(userId : Nat, quizId : Nat, score : Nat, total : Nat) : async Nat {
    let id = nextQuizResultId;
    nextQuizResultId += 1;
    quizResults.add({ id; userId; quizId; score; total; submittedAt = Time.now() });
    id
  };

  public query func getQuizResults() : async [QuizResult] {
    quizResults.toArray()
  };

  public query func getQuizResultsByUser(userId : Nat) : async [QuizResult] {
    quizResults.filter(func(r : QuizResult) : Bool { r.userId == userId }).toArray()
  };

  // ─── Assignment Management ────────────────────────────────────────────────

  public func addAssignment(title : Text, courseId : Nat, dueDate : Text, description : Text) : async Nat {
    let id = nextAssignmentId;
    nextAssignmentId += 1;
    assignments.add({ id; title; courseId; dueDate; description; createdAt = Time.now() });
    id
  };

  public query func getAssignments() : async [Assignment] {
    assignments.toArray()
  };

  public query func getAssignmentsByCourse(courseId : Nat) : async [Assignment] {
    assignments.filter(func(a : Assignment) : Bool { a.courseId == courseId }).toArray()
  };

  // ─── Assignment Submissions ───────────────────────────────────────────────

  public func submitAssignment(userId : Nat, assignmentId : Nat, content : Text) : async Nat {
    let id = nextSubmissionId;
    nextSubmissionId += 1;
    assignmentSubmissions.add({ id; userId; assignmentId; content; submittedAt = Time.now() });
    id
  };

  public query func getAssignmentSubmissions() : async [AssignmentSubmission] {
    assignmentSubmissions.toArray()
  };

  public query func getSubmissionsByUser(userId : Nat) : async [AssignmentSubmission] {
    assignmentSubmissions.filter(func(s : AssignmentSubmission) : Bool { s.userId == userId }).toArray()
  };

  // ─── Notifications ────────────────────────────────────────────────────────

  public func addNotification(userId : Nat, message : Text, type_ : Text) : async Nat {
    let id = nextNotifId;
    nextNotifId += 1;
    notifications.add({ id; userId; message; type_; isRead = false; createdAt = Time.now() });
    id
  };

  public query func getNotifications(userId : Nat) : async [Notification] {
    notifications.filter(func(n : Notification) : Bool { n.userId == userId }).toArray()
  };

  public func markNotificationRead(id : Nat) : async Bool {
    var found = false;
    notifications.mapInPlace(func(n : Notification) : Notification {
      if (n.id == id) {
        found := true;
        { n with isRead = true }
      } else { n }
    });
    found
  };
};
