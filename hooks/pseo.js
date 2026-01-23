/**
 * Programmatic SEO Utility
 * Handles dynamic metadata injection and Structured Data (JSON-LD)
 */

export const SEO = {
  /**
   * Update Page Metadata (Title, Meta Desc, Canonical)
   */
  updateMeta: (data) => {
    // Update Title
    if (data.title) {
      document.title = data.title;
      // Also update Open Graph Title
      SEO.setMetaTag("property", "og:title", data.title);
      SEO.setMetaTag("name", "twitter:title", data.title);
    }

    // Update Description
    if (data.description) {
      SEO.setMetaTag("name", "description", data.description);
      SEO.setMetaTag("property", "og:description", data.description);
      SEO.setMetaTag("name", "twitter:description", data.description);
    }

    // Update URL / Canonical
    if (data.url) {
      let link = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", data.url);
      SEO.setMetaTag("property", "og:url", data.url);
    }

    // Update Image
    if (data.image) {
      SEO.setMetaTag("property", "og:image", data.image);
      SEO.setMetaTag("name", "twitter:image", data.image);
    }
  },

  /**
   * Helper to set meta tags
   */
  setMetaTag: (attr, key, content) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attr}="${key}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attr, key);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  },

  /**
   * Inject JSON-LD Structured Data
   */
  injectSchema: (schemaData) => {
    const scriptId = "seo-json-ld";
    let script = document.getElementById(scriptId);

    if (script) {
      script.remove();
    }

    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  },

  /**
   * Generate JobPosting Schema
   */
  generateJobSchema: (job) => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description: job.overview,
      datePosted: job.createdAt,
      hiringOrganization: {
        "@type": "Organization",
        name: job.source,
        sameAs: job.applyLink,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          // Defaulting to typical govt job range if not specified
          minValue: 20000,
          maxValue: 80000,
          unitText: "MONTH",
        },
      },
      employmentType: "FULL_TIME",
    };

    // Add validThrough if available (e.g. 30 days from creation)
    if (job.createdAt) {
      const date = new Date(job.createdAt);
      date.setDate(date.getDate() + 30);
      schema.validThrough = date.toISOString();
    }

    return schema;
  },

  /**
   * Generate Article/BlogPosting Schema
   */
  generateBlogSchema: (blog) => {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: blog.title,
      image: [
        "https://latestjobs.space/assets/og-default.png", // Replace with actual blog image if dynamic
      ],
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt || blog.createdAt,
      author: {
        "@type": "Organization",
        name: "LatestJobs Team",
        url: "https://latestjobs.space",
      },
      publisher: {
        "@type": "Organization",
        name: "LatestJobs.space",
        logo: {
          "@type": "ImageObject",
          url: "https://latestjobs.space/favicon.svg",
        },
      },
      description: blog.metaDescription,
    };
  },
};
