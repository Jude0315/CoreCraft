const GenerateFrontendFiles = (specification) => {
  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const pages = Array.isArray(specification.pages)
    ? specification.pages
    : [];

  const appType =
    specification.appType ||
    "Application";

  const pageFiles = pages.map((page) => {
    const componentName =
      NormalizeComponentName(page);

    return {
      type: "page",
      page,
      filename: `${componentName}.jsx`,
      componentName,
      content: GeneratePageComponent(
        componentName,
        page,
        appType
      ),
    };
  });

  return {
    pageFiles,
  };
};

const NormalizeComponentName = (pageName) => {
  return pageName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join("");
};

const GeneratePageComponent = (
  componentName,
  displayName,
  appType
) => {
  const normalized =
    appType.toLowerCase();

  if (normalized === "lms") {
    return GenerateLmsPage(
      componentName,
      displayName
    );

    
  }



  return GenerateGenericPage(
    componentName,
    displayName,
    appType
  );
};

const GenerateLmsPage = (
  componentName,
  displayName
) => {
  if (componentName === "HomePage") {
    return `import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            Learn smarter
          </span>

          <h1>
            Build skills. Track progress.
            Reach your goals.
          </h1>

          <p>
            Access courses, quizzes,
            assignments and progress tracking
            in one learning workspace.
          </p>

          <div className="hero-actions">
            <Link
              className="primary-button hero-button"
              to="/courses"
            >
              Explore Courses
            </Link>

            <Link
              className="secondary-button"
              to="/dashboard"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <span>Learning Overview</span>
            <strong>72%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: "72%" }}
            />
          </div>

          <div className="hero-stat-grid">
            <div>
              <strong>6</strong>
              <span>Courses</span>
            </div>

            <div>
              <strong>14</strong>
              <span>Lessons</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Assignments</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">
            Platform features
          </span>

          <h2>
            Everything needed for focused learning
          </h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Courses</h3>
            <p>
              Browse learning content and
              continue lessons from one place.
            </p>
          </article>

          <article className="feature-card">
            <h3>Assignments</h3>
            <p>
              Manage upcoming tasks and
              track completed work.
            </p>
          </article>

          <article className="feature-card">
            <h3>Quizzes</h3>
            <p>
              Test understanding and improve
              knowledge through assessments.
            </p>
          </article>

          <article className="feature-card">
            <h3>Progress</h3>
            <p>
              Monitor course completion and
              learning performance.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
`;
  }

  if (componentName === "Dashboard") {
    return `import React from "react";
import { useAuth } from "../Context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <main className="page-shell">
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">
            Dashboard
          </span>

          <h1>
            Welcome back,
            {" "}
            {user?.name || "Learner"}
          </h1>

          <p>
            Continue learning and stay
            on top of your progress.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Active Courses</span>
          <strong>4</strong>
        </article>

        <article className="stat-card">
          <span>Assignments</span>
          <strong>3</strong>
        </article>

        <article className="stat-card">
          <span>Average Progress</span>
          <strong>72%</strong>
        </article>

        <article className="stat-card">
          <span>Completed Quizzes</span>
          <strong>8</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <div className="card-heading">
            <h2>Continue Learning</h2>
          </div>

          <div className="course-list">
            <div className="course-row">
              <div>
                <strong>
                  Introduction to Programming
                </strong>

                <span>
                  8 of 12 lessons
                </span>
              </div>

              <strong>67%</strong>
            </div>

            <div className="course-row">
              <div>
                <strong>
                  Web Development Fundamentals
                </strong>

                <span>
                  5 of 8 lessons
                </span>
              </div>

              <strong>63%</strong>
            </div>
          </div>
        </article>

        <article className="content-card">
          <div className="card-heading">
            <h2>Upcoming</h2>
          </div>

          <div className="activity-list">
            <div>
              <strong>
                JavaScript Quiz
              </strong>

              <span>
                Due tomorrow
              </span>
            </div>

            <div>
              <strong>
                React Assignment
              </strong>

              <span>
                Due in 3 days
              </span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
`;
  }

  if (componentName === "CoursesPage") {
  return `import React from "react";

const CoursesPage = () => {
  const courses = [
    {
      title: "Introduction to Programming",
      category: "Development",
      progress: 67,
      lessons: 12,
      instructor: "CoreCraft Instructor",
    },
    {
      title: "Web Development Fundamentals",
      category: "Web",
      progress: 45,
      lessons: 10,
      instructor: "CoreCraft Instructor",
    },
    {
      title: "Database Essentials",
      category: "Database",
      progress: 82,
      lessons: 9,
      instructor: "CoreCraft Instructor",
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Courses
        </span>

        <h1>
          Continue your learning journey
        </h1>

        <p>
          Browse enrolled courses and track
          your progress across each module.
        </p>
      </section>

      <section className="course-grid">
        {courses.map((course) => (
          <article
            key={course.title}
            className="course-card"
          >
            <div className="course-card-top">
              <span className="course-category">
                {course.category}
              </span>

              <span className="course-progress-value">
                {course.progress}%
              </span>
            </div>

            <h3>{course.title}</h3>

            <p className="course-instructor">
              {course.instructor}
            </p>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width:
                    \`\${course.progress}%\`,
                }}
              />
            </div>

            <div className="course-card-footer">
              <span>
                {course.lessons} lessons
              </span>

              <button className="secondary-button">
                Continue
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default CoursesPage;
`;
}

if (componentName === "InstructorPortal") {
  return `import React from "react";

const InstructorPortal = () => {
  return (
    <main className="page-shell">
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">
            Instructor Portal
          </span>

          <h1>
            Manage your learning content
          </h1>

          <p>
            Create courses, monitor learners
            and manage teaching activities.
          </p>
        </div>

        <button className="primary-button action-button">
          + Create Course
        </button>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Active Courses</span>
          <strong>6</strong>
        </article>

        <article className="stat-card">
          <span>Total Students</span>
          <strong>128</strong>
        </article>

        <article className="stat-card">
          <span>Assignments</span>
          <strong>14</strong>
        </article>

        <article className="stat-card">
          <span>Average Completion</span>
          <strong>76%</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <div className="card-heading">
            <h2>Your Courses</h2>
          </div>

          <div className="instructor-course-list">
            <div className="instructor-course-row">
              <div>
                <strong>
                  Introduction to Programming
                </strong>

                <span>
                  42 students
                </span>
              </div>

              <div className="row-actions">
                <button className="secondary-button">
                  Manage
                </button>
              </div>
            </div>

            <div className="instructor-course-row">
              <div>
                <strong>
                  Web Development Fundamentals
                </strong>

                <span>
                  36 students
                </span>
              </div>

              <div className="row-actions">
                <button className="secondary-button">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="content-card">
          <div className="card-heading">
            <h2>Recent Activity</h2>
          </div>

          <div className="activity-list">
            <div>
              <strong>
                New student enrolled
              </strong>

              <span>
                Programming course
              </span>
            </div>

            <div>
              <strong>
                Quiz submitted
              </strong>

              <span>
                Web Development
              </span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default InstructorPortal;
`;

if (componentName === "CourseDetailsPage") {
  return `import React from "react";

const CourseDetailsPage = () => {
  const lessons = [
    {
      title: "Introduction",
      duration: "12 min",
      completed: true,
    },
    {
      title: "Variables and Data Types",
      duration: "24 min",
      completed: true,
    },
    {
      title: "Control Flow",
      duration: "32 min",
      completed: false,
    },
    {
      title: "Functions",
      duration: "28 min",
      completed: false,
    },
  ];

  return (
    <main className="page-shell">
      <section className="course-detail-header">
        <div>
          <span className="eyebrow">
            Development
          </span>

          <h1>
            Introduction to Programming
          </h1>

          <p>
            Learn programming fundamentals,
            problem solving and core development
            concepts through structured lessons.
          </p>
        </div>

        <div className="course-summary-card">
          <strong>67%</strong>
          <span>Course Progress</span>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: "67%" }}
            />
          </div>
        </div>
      </section>

      <section className="course-detail-grid">
        <article className="content-card">
          <div className="card-heading">
            <h2>Course Content</h2>
          </div>

          <div className="lesson-list">
            {lessons.map(
              (lesson, index) => (
                <div
                  className="lesson-row"
                  key={lesson.title}
                >
                  <div className="lesson-number">
                    {index + 1}
                  </div>

                  <div className="lesson-info">
                    <strong>
                      {lesson.title}
                    </strong>

                    <span>
                      {lesson.duration}
                    </span>
                  </div>

                  <span
                    className={
                      lesson.completed
                        ? "status-complete"
                        : "status-pending"
                    }
                  >
                    {lesson.completed
                      ? "Completed"
                      : "Continue"}
                  </span>
                </div>
              )
            )}
          </div>
        </article>

        <aside className="content-card">
          <div className="card-heading">
            <h2>Course Information</h2>
          </div>

          <div className="detail-list">
            <div>
              <span>Instructor</span>
              <strong>
                CoreCraft Instructor
              </strong>
            </div>

            <div>
              <span>Lessons</span>
              <strong>12</strong>
            </div>

            <div>
              <span>Level</span>
              <strong>Beginner</strong>
            </div>

            <div>
              <span>Assignments</span>
              <strong>3</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default CourseDetailsPage;
`;

if (componentName === "QuizzesPage") {
  return `import React from "react";

const QuizzesPage = () => {
  const quizzes = [
    {
      title: "Programming Basics",
      course: "Introduction to Programming",
      questions: 10,
      status: "Completed",
      score: "85%",
    },
    {
      title: "JavaScript Fundamentals",
      course: "Web Development Fundamentals",
      questions: 15,
      status: "Available",
      score: "-",
    },
    {
      title: "Database Concepts",
      course: "Database Essentials",
      questions: 12,
      status: "Available",
      score: "-",
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Assessments
        </span>

        <h1>Quizzes</h1>

        <p>
          Test your knowledge and review
          assessment results across your courses.
        </p>
      </section>

      <section className="assessment-grid">
        {quizzes.map((quiz) => (
          <article
            className="assessment-card"
            key={quiz.title}
          >
            <div className="assessment-top">
              <span className="course-category">
                {quiz.course}
              </span>

              <span
                className={
                  quiz.status === "Completed"
                    ? "status-complete"
                    : "status-pending"
                }
              >
                {quiz.status}
              </span>
            </div>

            <h3>{quiz.title}</h3>

            <div className="assessment-meta">
              <span>
                {quiz.questions} questions
              </span>

              <span>
                Score: {quiz.score}
              </span>
            </div>

            <button className="secondary-button">
              {quiz.status === "Completed"
                ? "Review Quiz"
                : "Start Quiz"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
};

export default QuizzesPage;
`;
}
if (componentName === "AssignmentsPage") {
  return `import React from "react";

const AssignmentsPage = () => {
  const assignments = [
    {
      title: "Programming Exercise",
      course: "Introduction to Programming",
      due: "Tomorrow",
      status: "Pending",
    },
    {
      title: "Build a React Component",
      course: "Web Development Fundamentals",
      due: "3 days",
      status: "Pending",
    },
    {
      title: "Database Design Task",
      course: "Database Essentials",
      due: "Submitted",
      status: "Completed",
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Coursework
        </span>

        <h1>Assignments</h1>

        <p>
          Keep track of upcoming coursework,
          submission status and deadlines.
        </p>
      </section>

      <section className="content-card">
        <div className="assignment-list">
          {assignments.map(
            (assignment) => (
              <div
                className="assignment-row"
                key={assignment.title}
              >
                <div>
                  <strong>
                    {assignment.title}
                  </strong>

                  <span>
                    {assignment.course}
                  </span>
                </div>

                <div className="assignment-meta">
                  <span>
                    {assignment.due}
                  </span>

                  <span
                    className={
                      assignment.status ===
                      "Completed"
                        ? "status-complete"
                        : "status-pending"
                    }
                  >
                    {assignment.status}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
};

export default AssignmentsPage;
`;
}
}


}

  return GenerateGenericPage(
    componentName,
    displayName,
    "LMS"
  );
};

const GenerateGenericPage = (
  componentName,
  displayName,
  appType
) => {
  return `import React from "react";

const ${componentName} = () => {
  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          ${appType}
        </span>

        <h1>${displayName}</h1>

        <p>
          Manage and explore ${displayName.toLowerCase()}
          from your generated application.
        </p>
      </section>
    </main>
  );
};

export default ${componentName};
`;
};


module.exports = {
  GenerateFrontendFiles,
  NormalizeComponentName,
  GeneratePageComponent,
  GenerateLmsPage,
  GenerateGenericPage,
};