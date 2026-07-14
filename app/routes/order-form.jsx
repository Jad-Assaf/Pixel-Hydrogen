import {data, Form, useActionData, useNavigation} from 'react-router';
import orderFormStyles from '~/styles/order-form.css?url';

export function links() {
  return [{rel: 'stylesheet', href: orderFormStyles}];
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Pixel Zones | Activate Your Warranty'},
    {
      name: 'description',
      content: 'Register your information to activate your warranty.',
    },
  ];
};

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({ok: false, error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();
  const input = parseOrderForm(form);
  const validationError = validateOrderInput(input);

  if (validationError) {
    return data({ok: false, error: validationError}, {status: 400});
  }

  try {
    const result = await upsertWarrantyCustomer(context.env, input);

    return {
      ok: true,
      error: null,
      customer: result.customer,
      created: result.created,
    };
  } catch (error) {
    console.error('[order-form] Shopify customer sync failed', error);

    return data(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to submit your details right now.',
      },
      {status: 500},
    );
  }
}

export default function OrderFormPage() {
  /** @type {ActionReturnData | undefined} */
  const action = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  return (
    <div className="pz-order-page">
      <section className="pz-order-shell" aria-labelledby="order-form-title">
        <div className="pz-order-intro">
          <h1 id="order-form-title">Activate Your Warranty</h1>
          <p>Register your information to activate your warranty</p>
        </div>

        <Form className="pz-order-form" method="post">
          <div className="pz-order-form-header">
            <div>
              <p className="pz-order-form-label">Customer Details</p>
              <h2>Warranty activation form</h2>
            </div>
          </div>

          <div className="pz-order-grid">
            <label className="pz-order-field">
              <span>Name</span>
              <input
                name="name"
                type="text"
                autoComplete="given-name"
                placeholder="Jad"
                required
              />
            </label>

            <label className="pz-order-field">
              <span>Family Name</span>
              <input
                name="familyName"
                type="text"
                autoComplete="family-name"
                placeholder="Haddad"
                required
              />
            </label>

            <label className="pz-order-field">
              <span>Phone Number</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+961 81 539 339"
                required
              />
            </label>

            <label className="pz-order-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="pz-order-field pz-order-field--wide">
              <span>Location</span>
              <input
                name="location"
                type="text"
                autoComplete="street-address"
                placeholder="Beirut, Achrafieh"
                required
              />
            </label>

            <label className="pz-order-field pz-order-field--wide">
              <span>Toters Order Number</span>
              <input
                name="totersOrderNumber"
                type="text"
                autoComplete="off"
                placeholder="TOT-123456"
                required
              />
            </label>
          </div>

          <div className="pz-order-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit details'}
            </button>
          </div>

          {action?.error ? (
            <p className="pz-order-error" role="alert">
              {action.error}
            </p>
          ) : null}
        </Form>

        {action?.ok ? (
          <div className="pz-order-popup-backdrop" role="presentation">
            <section
              className="pz-order-popup"
              role="status"
              aria-live="polite"
              aria-label="Warranty activated"
            >
              <span className="pz-order-popup-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h2>Your warranty has been successfully activated.</h2>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}

/**
 * @param {FormData} form
 */
function parseOrderForm(form) {
  return {
    name: getFormString(form, 'name'),
    familyName: getFormString(form, 'familyName'),
    phone: normalizePhone(getFormString(form, 'phone')),
    email: getFormString(form, 'email').toLowerCase(),
    location: getFormString(form, 'location'),
    totersOrderNumber: getFormString(form, 'totersOrderNumber'),
  };
}

/**
 * @param {FormData} form
 * @param {string} key
 */
function getFormString(form, key) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * @param {OrderFormInput} input
 */
function validateOrderInput(input) {
  if (!input.name) return 'Name is required.';
  if (!input.familyName) return 'Family name is required.';
  if (!input.phone) return 'Phone number is required.';
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return 'A valid email is required.';
  }
  if (!input.location) return 'Location is required.';
  if (!input.totersOrderNumber) return 'Toters order number is required.';

  return null;
}

/**
 * @param {string} phone
 */
function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * @param {Env} env
 * @param {OrderFormInput} input
 */
async function upsertWarrantyCustomer(env, input) {
  const existingCustomer = await findCustomerByEmail(env, input.email);

  if (existingCustomer?.id) {
    const customer = await updateWarrantyCustomer(env, existingCustomer.id, input);
    await addWarrantyCustomerDetails(env, customer.id, input);

    return {
      created: false,
      customer,
    };
  }

  const customer = await createWarrantyCustomer(env, input);

  return {
    created: true,
    customer,
  };
}

/**
 * @param {Env} env
 * @param {string} email
 */
async function findCustomerByEmail(env, email) {
  const response = await adminGraphql(env, CUSTOMER_BY_EMAIL_QUERY, {
    query: `email:${escapeShopifySearchValue(email)}`,
  });

  return response.customers?.nodes?.[0] || null;
}

/**
 * @param {Env} env
 * @param {OrderFormInput} input
 */
async function createWarrantyCustomer(env, input) {
  const response = await adminGraphql(env, CUSTOMER_CREATE_MUTATION, {
    input: buildCustomerInput(input),
  });
  const payload = response.customerCreate;

  assertNoUserErrors(payload?.userErrors);

  if (!payload?.customer?.id) {
    throw new Error('Shopify did not return a created customer.');
  }

  return payload.customer;
}

/**
 * @param {Env} env
 * @param {string} customerId
 * @param {OrderFormInput} input
 */
async function updateWarrantyCustomer(env, customerId, input) {
  const response = await adminGraphql(env, CUSTOMER_UPDATE_MUTATION, {
    input: {
      id: customerId,
      email: input.email,
      phone: input.phone,
      firstName: input.name,
      lastName: input.familyName,
    },
  });
  const payload = response.customerUpdate;

  assertNoUserErrors(payload?.userErrors);

  if (!payload?.customer?.id) {
    throw new Error('Shopify did not return an updated customer.');
  }

  return payload.customer;
}

/**
 * @param {Env} env
 * @param {string} customerId
 * @param {OrderFormInput} input
 */
async function addWarrantyCustomerDetails(env, customerId, input) {
  const [tagsResponse, metafieldsResponse] = await Promise.all([
    adminGraphql(env, TAGS_ADD_MUTATION, {
      id: customerId,
      tags: WARRANTY_CUSTOMER_TAGS,
    }),
    adminGraphql(env, METAFIELDS_SET_MUTATION, {
      metafields: buildWarrantyCustomerMetafields(customerId, input),
    }),
  ]);

  assertNoUserErrors(tagsResponse.tagsAdd?.userErrors);
  assertNoUserErrors(metafieldsResponse.metafieldsSet?.userErrors);
}

/**
 * @param {OrderFormInput} input
 */
function buildCustomerInput(input) {
  return {
    email: input.email,
    phone: input.phone,
    firstName: input.name,
    lastName: input.familyName,
    tags: WARRANTY_CUSTOMER_TAGS,
    metafields: buildWarrantyCustomerMetafields(null, input),
  };
}

/**
 * @param {string | null} ownerId
 * @param {OrderFormInput} input
 */
function buildWarrantyCustomerMetafields(ownerId, input) {
  const withOwner = (metafield) =>
    ownerId ? {...metafield, ownerId} : metafield;

  return [
    withOwner({
      namespace: WARRANTY_METAFIELD_NAMESPACE,
      key: WARRANTY_ORDER_METAFIELD_KEY,
      type: 'single_line_text_field',
      value: input.totersOrderNumber,
    }),
    withOwner({
      namespace: WARRANTY_METAFIELD_NAMESPACE,
      key: WARRANTY_LOCATION_METAFIELD_KEY,
      type: 'single_line_text_field',
      value: input.location,
    }),
  ];
}

/**
 * @param {Env} env
 * @param {string} query
 * @param {Record<string, unknown>} variables
 */
async function adminGraphql(env, query, variables) {
  const token = getAdminApiToken(env);
  const shopDomain = getAdminShopDomain(env);
  const response = await fetch(
    `https://${shopDomain}/admin/api/2026-07/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables}),
    },
  );
  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Shopify Admin API request failed with ${response.status}.`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message || 'Shopify Admin API error.');
  }

  return json.data;
}

/**
 * @param {Env} env
 */
function getAdminApiToken(env) {
  const token =
    env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
    env.PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
    env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
    env.ADMIN_API_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      'Missing Shopify Admin API token. Add SHOPIFY_ADMIN_API_ACCESS_TOKEN with write_customers access.',
    );
  }

  return token;
}

/**
 * @param {Env} env
 */
function getAdminShopDomain(env) {
  const domain =
    env.SHOPIFY_STORE_DOMAIN ||
    env.PRIVATE_STORE_DOMAIN ||
    env.PUBLIC_STORE_DOMAIN ||
    env.PUBLIC_CHECKOUT_DOMAIN;

  if (!domain) {
    throw new Error('Missing Shopify store domain environment variable.');
  }

  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * @param {{field?: string[] | null; message?: string}[] | undefined} userErrors
 */
function assertNoUserErrors(userErrors) {
  if (userErrors?.length) {
    throw new Error(userErrors[0].message || 'Shopify returned a user error.');
  }
}

/**
 * @param {string} value
 */
function escapeShopifySearchValue(value) {
  return JSON.stringify(value);
}

const WARRANTY_CUSTOMER_TAGS = ['Warranty', 'warranty-form'];
const WARRANTY_METAFIELD_NAMESPACE = 'custom';
const WARRANTY_ORDER_METAFIELD_KEY = 'toters_order_number';
const WARRANTY_LOCATION_METAFIELD_KEY = 'warranty_location';

const CUSTOMER_BY_EMAIL_QUERY = `
  query WarrantyCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        email
        phone
        firstName
        lastName
      }
    }
  }
`;

const CUSTOMER_CREATE_MUTATION = `
  mutation WarrantyCustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      userErrors {
        field
        message
      }
      customer {
        id
        email
        phone
        firstName
        lastName
      }
    }
  }
`;

const CUSTOMER_UPDATE_MUTATION = `
  mutation WarrantyCustomerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      userErrors {
        field
        message
      }
      customer {
        id
        email
        phone
        firstName
        lastName
      }
    }
  }
`;

const TAGS_ADD_MUTATION = `
  mutation WarrantyTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `
  mutation WarrantyMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * @typedef {{
 *   name: string;
 *   familyName: string;
 *   phone: string;
 *   email: string;
 *   location: string;
 *   totersOrderNumber: string;
 * }} OrderFormInput
 */

/** @typedef {import('./+types/order-form').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
