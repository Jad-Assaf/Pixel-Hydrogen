import {data, Form, useActionData, useNavigation} from 'react-router';
import totersOrderStyles from '~/styles/toters-order.css?url';

export function links() {
  return [{rel: 'stylesheet', href: totersOrderStyles}];
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Pixel Zones | Toters Order Form'},
    {
      name: 'description',
      content: 'Submit your Toters order details to Pixel Zones.',
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
  const input = parseTotersOrderForm(form);
  const validationError = validateTotersOrderInput(input);

  if (validationError) {
    return data({ok: false, error: validationError}, {status: 400});
  }

  try {
    const result = await upsertTotersCustomer(context.env, input);

    return {
      ok: true,
      error: null,
      customer: result.customer,
      created: result.created,
    };
  } catch (error) {
    console.error('[toters-order] Shopify customer sync failed', error);

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

export default function TotersOrderPage() {
  /** @type {ActionReturnData | undefined} */
  const action = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  return (
    <div className="pz-toters-page">
      <section className="pz-toters-shell" aria-labelledby="toters-order-title">
        <div className="pz-toters-intro">
          <h1 id="toters-order-title">Share your order details</h1>
          <p>
            Send the core information we need to identify your Toters purchase
            and prepare the next step with Pixel Zones.
          </p>
        </div>

        <Form className="pz-toters-form" method="post">
          <div className="pz-toters-form-header">
            <div>
              <p className="pz-toters-form-label">Customer Details</p>
              <h2>Toters order form</h2>
            </div>
          </div>

          <div className="pz-toters-grid">
            <label className="pz-toters-field">
              <span>Name</span>
              <input
                name="name"
                type="text"
                autoComplete="given-name"
                placeholder="Jad"
                required
              />
            </label>

            <label className="pz-toters-field">
              <span>Family Name</span>
              <input
                name="familyName"
                type="text"
                autoComplete="family-name"
                placeholder="Haddad"
                required
              />
            </label>

            <label className="pz-toters-field">
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

            <label className="pz-toters-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="pz-toters-field pz-toters-field--wide">
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

          <div className="pz-toters-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit details'}
            </button>
          </div>

          {action?.ok ? (
            <p className="pz-toters-confirm" role="status">
              Details synced to Shopify
              {action.created ? ' as a new customer.' : ' on the existing customer.'}
            </p>
          ) : null}

          {action?.error ? (
            <p className="pz-toters-error" role="alert">
              {action.error}
            </p>
          ) : null}
        </Form>
      </section>
    </div>
  );
}

/**
 * @param {FormData} form
 */
function parseTotersOrderForm(form) {
  return {
    name: getFormString(form, 'name'),
    familyName: getFormString(form, 'familyName'),
    phone: normalizePhone(getFormString(form, 'phone')),
    email: getFormString(form, 'email').toLowerCase(),
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
 * @param {TotersOrderInput} input
 */
function validateTotersOrderInput(input) {
  if (!input.name) return 'Name is required.';
  if (!input.familyName) return 'Family name is required.';
  if (!input.phone) return 'Phone number is required.';
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return 'A valid email is required.';
  }
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
 * @param {TotersOrderInput} input
 */
async function upsertTotersCustomer(env, input) {
  const existingCustomer = await findCustomerByEmail(env, input.email);

  if (existingCustomer?.id) {
    const customer = await updateTotersCustomer(env, existingCustomer.id, input);
    await addTotersCustomerDetails(env, customer.id, input);

    return {
      created: false,
      customer,
    };
  }

  const customer = await createTotersCustomer(env, input);

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
 * @param {TotersOrderInput} input
 */
async function createTotersCustomer(env, input) {
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
 * @param {TotersOrderInput} input
 */
async function updateTotersCustomer(env, customerId, input) {
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
 * @param {TotersOrderInput} input
 */
async function addTotersCustomerDetails(env, customerId, input) {
  const [tagsResponse, metafieldsResponse] = await Promise.all([
    adminGraphql(env, TAGS_ADD_MUTATION, {
      id: customerId,
      tags: TOTERS_CUSTOMER_TAGS,
    }),
    adminGraphql(env, METAFIELDS_SET_MUTATION, {
      metafields: [buildTotersOrderMetafield(customerId, input.totersOrderNumber)],
    }),
  ]);

  assertNoUserErrors(tagsResponse.tagsAdd?.userErrors);
  assertNoUserErrors(metafieldsResponse.metafieldsSet?.userErrors);
}

/**
 * @param {TotersOrderInput} input
 */
function buildCustomerInput(input) {
  return {
    email: input.email,
    phone: input.phone,
    firstName: input.name,
    lastName: input.familyName,
    tags: TOTERS_CUSTOMER_TAGS,
    metafields: [
      {
        namespace: TOTERS_METAFIELD_NAMESPACE,
        key: TOTERS_ORDER_METAFIELD_KEY,
        type: 'single_line_text_field',
        value: input.totersOrderNumber,
      },
    ],
  };
}

/**
 * @param {string} ownerId
 * @param {string} orderNumber
 */
function buildTotersOrderMetafield(ownerId, orderNumber) {
  return {
    ownerId,
    namespace: TOTERS_METAFIELD_NAMESPACE,
    key: TOTERS_ORDER_METAFIELD_KEY,
    type: 'single_line_text_field',
    value: orderNumber,
  };
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

const TOTERS_CUSTOMER_TAGS = ['toters', 'toters-order-form'];
const TOTERS_METAFIELD_NAMESPACE = 'custom';
const TOTERS_ORDER_METAFIELD_KEY = 'toters_order_number';

const CUSTOMER_BY_EMAIL_QUERY = `
  query TotersCustomerByEmail($query: String!) {
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
  mutation TotersCustomerCreate($input: CustomerInput!) {
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
  mutation TotersCustomerUpdate($input: CustomerInput!) {
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
  mutation TotersTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `
  mutation TotersMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
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
 *   totersOrderNumber: string;
 * }} TotersOrderInput
 */

/** @typedef {import('./+types/toters-order').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
