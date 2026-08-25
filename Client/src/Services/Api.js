const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export async function apiRequest(
  endpoint,
  options = {},
) {
  const token =
    localStorage.getItem(
      "corecraft_token",
    );

  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Something went wrong",
    );
  }

  return data;
}

export function getProjects() {
  return apiRequest(
    "/projects",
  );
}

export function getProjectById(
  projectId,
) {
  return apiRequest(
    `/projects/${projectId}`,
  );
}

export function createProject(
  name,
) {
  return apiRequest(
    "/projects",
    {
      method: "POST",

      body: JSON.stringify({
        name,
      }),
    },
  );
}

export function createRequirementSession(
  projectId,
) {
  return apiRequest(
    "/builder/session",
    {
      method: "POST",

      body: JSON.stringify({
        projectId,
      }),
    },
  );
}

export function getRequirementSession(
  projectId,
) {
  return apiRequest(
    `/builder/session/${projectId}`,
  );
}

export function addBuilderMessage(
  sessionId,
  role,
  content,
) {
  return apiRequest(
    `/builder/message/${sessionId}`,
    {
      method: "POST",

      body: JSON.stringify({
        role,
        content,
      }),
    },
  );
}

export function getSuggestions(
  appType,
) {
  return apiRequest(
    `/builder/suggestions/${encodeURIComponent(
      appType,
    )}`,
  );
}

export function addFeature(
  sessionId,
  feature,
) {
  return apiRequest(
    `/builder/feature/${sessionId}`,
    {
      method: "POST",

      body: JSON.stringify({
        feature,
      }),
    },
  );
}

export function removeFeature(
  sessionId,
  feature,
) {
  return apiRequest(
    `/builder/feature/remove/${sessionId}`,
    {
      method: "POST",

      body: JSON.stringify({
        feature,
      }),
    },
  );
}

export function acceptSuggestion(
  sessionId,
  suggestion,
) {
  return apiRequest(
    `/builder/suggestion/accept/${sessionId}`,
    {
      method: "POST",

      body: JSON.stringify({
        suggestion,
      }),
    },
  );
}

export function rejectSuggestion(
  sessionId,
  suggestion,
) {
  return apiRequest(
    `/builder/suggestion/reject/${sessionId}`,
    {
      method: "POST",

      body: JSON.stringify({
        suggestion,
      }),
    },
  );
}

export function generateBuilderAiResponse(
  sessionId,
) {
  return apiRequest(
    `/builder/ai-response/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export function finalizeRequirementSession(
  sessionId,
) {
  return apiRequest(
    `/builder/finalize/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export function generateSpecification(
  sessionId,
) {
  return apiRequest(
    `/generation/specification/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export function generateSchemas(
  sessionId,
) {
  return apiRequest(
    `/generation/schemas/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export function generateBackend(
  sessionId,
) {
  return apiRequest(
    `/generation/backend/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export function generateFrontend(
  sessionId,
) {
  return apiRequest(
    `/generation/frontend/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export function generateFullProject(
  sessionId,
) {
  return apiRequest(
    `/generation/project/${sessionId}`,
    {
      method: "POST",
    },
  );
}

export async function downloadGeneratedProject(
  sessionId,
) {
  const token =
    localStorage.getItem(
      "corecraft_token",
    );

  const response =
    await fetch(
      `${API_URL}/generation/download/${sessionId}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Unable to download generated project";

    try {
      const data =
        await response.json();

      message =
        data?.message ||
        message;
    } catch {
      // Response was not JSON.
    }

    throw new Error(
      message,
    );
  }

  const blob =
    await response.blob();

  const disposition =
    response.headers.get(
      "content-disposition",
    );

  let filename =
    "CoreCraft-Generated-Project.zip";

  if (disposition) {
    const match =
      disposition.match(
        /filename="?([^"]+)"?/i,
      );

    if (match?.[1]) {
      filename =
        match[1];
    }
  }

  const url =
    window.URL.createObjectURL(
      blob,
    );

  const anchor =
    document.createElement(
      "a",
    );

  anchor.href = url;

  anchor.download =
    filename;

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();

  window.URL.revokeObjectURL(
    url,
  );
}
