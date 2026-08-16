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
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  CourseApi,
} from "../Services/Api";

const CoursesPage = () => {
  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const LoadCourses = async () => {
      try {
        const response =
          await CourseApi.getAll();

        setCourses(
          response.data.data || []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load courses"
        );
      } finally {
        setLoading(false);
      }
    };

    LoadCourses();
  }, []);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-card">
          Loading courses...
        </div>
      </main>
    );
  }

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
          Browse available courses and
          continue learning.
        </p>
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <section className="content-card">
          <h2>No courses yet</h2>

          <p>
            Courses created by instructors
            will appear here.
          </p>
        </section>
      ) : (
        <section className="course-grid">
          {courses.map((course) => (
            <article
              key={course._id}
              className="course-card"
            >
              <div className="course-card-top">
                <span className="course-category">
                  Course
                </span>

                <span className="course-progress-value">
                  {course.published
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <h3>
                {course.title}
              </h3>

              <p className="course-instructor">
                {course.description ||
                  "No description available."}
              </p>

              <div className="course-card-footer">
                <span>
                  {course.lessons?.length || 0}
                  {" "}
                  lessons
                </span>

                <a
                  className="secondary-button"
                  href={\`/course-details?id=\${course._id}\`}
                >
                  View Course
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default CoursesPage;
`;
}

if (componentName === "InstructorPortal") {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  CourseApi,
} from "../Services/Api";

import {
  useAuth,
} from "../Context/AuthContext";

const InstructorPortal = () => {
  const { user } = useAuth();

  const [courses, setCourses] =
    useState([]);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      published: false,
    });

  const [editingCourseId, setEditingCourseId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const LoadCourses = async () => {
    try {
      const response =
        await CourseApi.getAll();

      setCourses(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    LoadCourses();
  }, []);

  const HandleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const ResetForm = () => {
    setForm({
      title: "",
      description: "",
      published: false,
    });

    setEditingCourseId(null);
  };

  const HandleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        published: form.published,
        instructor: user.id || user._id,
      };

      if (editingCourseId) {
        await CourseApi.update(
          editingCourseId,
          payload
        );

        setSuccess(
          "Course updated successfully"
        );
      } else {
        await CourseApi.create(
          payload
        );

        setSuccess(
          "Course created successfully"
        );
      }

      ResetForm();

      await LoadCourses();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const HandleEdit = (course) => {
    setEditingCourseId(
      course._id
    );

    setForm({
      title:
        course.title || "",
      description:
        course.description || "",
      published:
        Boolean(course.published),
    });

    setSuccess("");
    setError("");
  };

  const HandleTogglePublish =
    async (course) => {
      try {
        setError("");
        setSuccess("");

        await CourseApi.update(
          course._id,
          {
            published:
              !course.published,
          }
        );

        setSuccess(
          course.published
            ? "Course unpublished successfully"
            : "Course published successfully"
        );

        await LoadCourses();
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to update course status"
        );
      }
    };

  const HandleDelete =
    async (courseId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this course?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        await CourseApi.remove(
          courseId
        );

        setSuccess(
          "Course deleted successfully"
        );

        if (
          editingCourseId === courseId
        ) {
          ResetForm();
        }

        await LoadCourses();
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to delete course"
        );
      }
    };

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
            Create, update and publish
            teaching content.
          </p>
        </div>
      </section>

      <section className="instructor-layout">
        <article className="content-card">
          <div className="card-heading">
            <h2>
              {editingCourseId
                ? "Edit Course"
                : "Create Course"}
            </h2>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          <form
            className="course-form"
            onSubmit={HandleSubmit}
          >
            <div className="form-group">
              <label>
                Course title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={HandleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={HandleChange}
                rows="5"
              />
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="published"
                checked={
                  form.published
                }
                onChange={HandleChange}
              />

              Published
            </label>

            <div className="form-action-row">
              <button
                className="primary-button action-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingCourseId
                    ? "Update Course"
                    : "Create Course"}
              </button>

              {editingCourseId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={ResetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="content-card">
          <div className="card-heading">
            <h2>Your Courses</h2>
          </div>

          {loading ? (
            <p>
              Loading courses...
            </p>
          ) : courses.length === 0 ? (
            <p>
              No courses have been created yet.
            </p>
          ) : (
            <div className="instructor-course-list">
              {courses.map(
                (course) => (
                  <div
                    className="instructor-course-row"
                    key={course._id}
                  >
                    <div>
                      <strong>
                        {course.title}
                      </strong>

                      <span>
                        {course.published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <div className="row-actions">
                      <button
                        className="secondary-button"
                        onClick={() =>
                          HandleEdit(
                            course
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          HandleTogglePublish(
                            course
                          )
                        }
                      >
                        {course.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <a
                        className="secondary-button"
                        href={
                          \`/course-details?id=\${course._id}\`
                        }
                      >
                        View
                      </a>

                      {user?.role ===
                        "admin" && (
                        <button
                          className="danger-button"
                          onClick={() =>
                            HandleDelete(
                              course._id
                            )
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
};

export default InstructorPortal;
`;
}


if (componentName === "CourseDetailsPage") {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  CourseApi,
} from "../Services/Api";

const CourseDetailsPage = () => {
  const [searchParams] =
    useSearchParams();

  const courseId =
    searchParams.get("id");

  const [course, setCourse] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const LoadCourse = async () => {
      if (!courseId) {
        setError(
          "Course ID was not provided."
        );

        setLoading(false);
        return;
      }

      try {
        const response =
          await CourseApi.getById(
            courseId
          );

        setCourse(
          response.data.data
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load course"
        );
      } finally {
        setLoading(false);
      }
    };

    LoadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-card">
          Loading course...
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="page-shell">
        <div className="form-error">
          {error || "Course not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="course-detail-header">
        <div>
          <span className="eyebrow">
            Course
          </span>

          <h1>
            {course.title}
          </h1>

          <p>
            {course.description ||
              "No course description available."}
          </p>
        </div>

        <div className="course-summary-card">
          <strong>
            {course.published
              ? "Published"
              : "Draft"}
          </strong>

          <span>
            Course Status
          </span>

          <div className="detail-list">
            <div>
              <span>Lessons</span>

              <strong>
                {course.lessons?.length || 0}
              </strong>
            </div>

            <div>
              <span>Students</span>

              <strong>
                {course.students?.length || 0}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="course-detail-grid">
        <article className="content-card">
          <div className="card-heading">
            <h2>
              Course Content
            </h2>
          </div>

          {course.lessons?.length ? (
            <div className="lesson-list">
              {course.lessons.map(
                (lesson, index) => (
                  <div
                    className="lesson-row"
                    key={
                      lesson._id ||
                      lesson
                    }
                  >
                    <div className="lesson-number">
                      {index + 1}
                    </div>

                    <div className="lesson-info">
                      <strong>
                        Lesson {index + 1}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p>
              No lessons have been
              added to this course yet.
            </p>
          )}
        </article>

        <aside className="content-card">
          <div className="card-heading">
            <h2>
              Course Information
            </h2>
          </div>

          <div className="detail-list">
            <div>
              <span>Status</span>

              <strong>
                {course.published
                  ? "Published"
                  : "Draft"}
              </strong>
            </div>

            <div>
              <span>Lessons</span>

              <strong>
                {course.lessons?.length || 0}
              </strong>
            </div>

            <div>
              <span>Students</span>

              <strong>
                {course.students?.length || 0}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default CourseDetailsPage;
`;
}

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

if (
  componentName ===
  "ProgressTrackingPage"
) {
  return `import React from "react";

const ProgressTrackingPage = () => {
  const courses = [
    {
      name: "Introduction to Programming",
      progress: 67,
    },
    {
      name: "Web Development Fundamentals",
      progress: 45,
    },
    {
      name: "Database Essentials",
      progress: 82,
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Performance
        </span>

        <h1>Learning Progress</h1>

        <p>
          Review your overall learning activity
          and course completion.
        </p>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Overall Progress</span>
          <strong>68%</strong>
        </article>

        <article className="stat-card">
          <span>Lessons Completed</span>
          <strong>27</strong>
        </article>

        <article className="stat-card">
          <span>Quizzes Completed</span>
          <strong>8</strong>
        </article>

        <article className="stat-card">
          <span>Assignments Submitted</span>
          <strong>11</strong>
        </article>
      </section>

      <section className="content-card progress-card">
        <div className="card-heading">
          <h2>Course Progress</h2>
        </div>

        <div className="progress-course-list">
          {courses.map((course) => (
            <div
              className="progress-course-row"
              key={course.name}
            >
              <div className="progress-course-heading">
                <strong>
                  {course.name}
                </strong>

                <span>
                  {course.progress}%
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width:
                      \`\${course.progress}%\`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProgressTrackingPage;
`;
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