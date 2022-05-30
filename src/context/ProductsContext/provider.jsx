import * as React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { withApollo } from '@apollo/client/react/hoc';

import ProductsContext, { initialState } from '.';
import LoadingOverlay from '../../components/LoadingOverlay';

const PRODUCTS_QUERY = gql`{
    products(first: 10) {
        edges {
            cursor
            node {
                id
                title
                description
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}`

const PRODUCT_DELETE_MUTATION = gql`
    mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
            deletedProductId
        }
    }
`;

const Provider = ({ children, client }) => {
    const [state, setState] = React.useState(initialState);

    const { loading } = useQuery(PRODUCTS_QUERY, {
        onCompleted: async ({ products }) => {
            setState(prevState => ({
                ...prevState,
                products,
            }));
        }
    });

    const [deleteProduct] = useMutation(PRODUCT_DELETE_MUTATION);


    return (
        <ProductsContext.Provider value={{
            actions: {
                removeById: async (productId) => {
                    try {
                        await deleteProduct({
                            variables: {
                                input: {
                                    id: productId
                                }
                            },
                        });

                        await client.resetStore();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            },
            state,
        }}>
            {loading ? <LoadingOverlay /> : children}
        </ProductsContext.Provider>
    )

}

export default withApollo(Provider);