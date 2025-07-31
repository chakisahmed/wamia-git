import { ApolloError, gql, useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';

// Interfaces remain the same
export interface CategoryType {
    id: string;
    name: string;
    level: string;
    image: string;
    magefan_og_image: string;
    children: CategoryType[];
    include_in_menu: number;
}
export interface CategoriesResponse {
    items: CategoryType[];
    total_count: number;
}

// GQL Query remains the same
const GET_CATEGORIES_QUERY = gql`
  query GetCategories(
    $filters: CategoryFilterInput
    $pageSize: Int
    $currentPage: Int
  ) {
    categories(
      filters: $filters
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
        total_count
        items {
          id
          include_in_menu
          image
          name
          level
          magefan_og_image
          children {
            id
            name
            level
            image
            magefan_og_image
            include_in_menu
          }
        }
    }
  }
`;

interface UseCategoriesParams {
    parentId?: string;
    pageSize?: number;
    skip?: boolean;
    setRetryQueue?: React.Dispatch<React.SetStateAction<(() => Promise<void>)[]>>;
}
const isNetworkError = (error: ApolloError) => {
  return error.networkError !== null;
};
export const useCategories = ({
    parentId,
    pageSize = 10,
    skip = false,
    setRetryQueue
}: UseCategoriesParams) => {

    const variables = useMemo(() => {
        const filters: Record<string, any> = {};
        filters.parent_id = { eq: parentId || "2" };
        return { filters, pageSize, currentPage: 1 };
    }, [parentId, pageSize]);

    const { data, loading, error, refetch, fetchMore: originalFetchMore } = useQuery<{ categories: CategoriesResponse }>(
        GET_CATEGORIES_QUERY,
        {
            variables,
            skip,
            notifyOnNetworkStatusChange: true,
        }
    );

    // =================================================================
    // --- THIS IS THE NEW FILTERING LOGIC ---
    // =================================================================
    const filteredData = useMemo(() => {
        // If there's no data, return an empty structure
        if (!data?.categories) {
            return { items: [], total_count: 0 };
        }

        // Apply the same filtering logic from your `fetchCategories2` function
        const filteredItems = data.categories.items
            .filter((category: CategoryType) => category.include_in_menu === 1)
            .map((category: CategoryType) => ({
                ...category,
                children: category.children.filter(
                    (child: CategoryType) => child.include_in_menu === 1
                ),
            }));

        return {
            items: filteredItems,
            // We pass the original total_count so pagination logic still works correctly.
            // Be aware: the total count reflects the unfiltered number.
            total_count: data.categories.total_count,
        };
    }, [data]); // This memo only re-runs when the raw `data` from the API changes.


    // We also need to wrap `fetchMore` so its `updateQuery` function also filters the new results.
    // This is an advanced but powerful pattern.
    const fetchMore = useCallback(
        (options:any) => {
            return originalFetchMore({
                ...options,
                updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult?.categories.items.length) {
                        return prev;
                    }
                    
                    // Filter the newly fetched items
                    const newFilteredItems = fetchMoreResult.categories.items
                        .filter(cat => cat.include_in_menu === 1)
                        .map(cat => ({
                            ...cat,
                            children: cat.children.filter(child => child.include_in_menu === 1)
                        }));

                    // Return the merged result
                    return {
                        ...prev,
                        categories: {
                            ...prev.categories,
                            // Important: use the unfiltered total_count from the new result
                            total_count: fetchMoreResult.categories.total_count, 
                            items: [
                                ...prev.categories.items,
                                ...newFilteredItems,
                            ],
                        },
                    };
                },
            });
        },
        [originalFetchMore]
    );

          useEffect(() => {
           // If there's an error, we have a setter function, and we're not in a loading state
           if (error && setRetryQueue && !loading) {
             if (isNetworkError(error)) {
               console.error('Apollo query failed due to network. Queuing refetch.');
               
               // The function we want to retry is `refetch`.
               // We wrap it to ensure it returns a promise.
               const refetchRequest = async () => {
                 await refetch();
               };
       
               // Add it to the queue
               setRetryQueue(prevQueue => [...prevQueue, refetchRequest]);
             }
           }
         }, [error, loading, refetch, setRetryQueue]); // Dependencies for the effect

    return {
        // Return the filtered data instead of the raw data
        categoriesData: filteredData,
        loading,
        error,
        refetch,
        fetchMore,
    };
};



// --- Interfaces (can be shared in a types file) ---
export interface CategoryType {
    id: string;
    name: string;
    level: string;
    image: string;
    magefan_og_image: string;
    children: CategoryType[];
    include_in_menu: number;
}

export interface CategoriesResponse {
    items: CategoryType[];
}

// --- GQL Query for First Level Categories ---
// This query is specific to this hook. We hardcode the parent_id filter.
const GET_FIRST_LEVEL_CATEGORIES_QUERY = gql`
  query GetFirstLevelCategories {
    categories(filters: { parent_id: { eq: "2" } }) {
      items {
        id
        include_in_menu
        image
        name
        level
        magefan_og_image
      }
    }
  }
`;

// --- Hook Parameters ---
interface UseFirstLevelCategoriesParams {
    skip?: boolean;
    setRetryQueue?: React.Dispatch<React.SetStateAction<(() => Promise<void>)[]>>;
}


// --- The Hook Implementation ---

/**
 * Fetches the first-level categories (children of the "Default Category").
 * It filters the results to only include categories marked as `include_in_menu`.
 */
export const useFirstLevelCategories = ({
    skip = false,
    setRetryQueue
}: UseFirstLevelCategoriesParams = {}) => { // Default params to empty object

    const { data, loading, error, refetch } = useQuery<{ categories: CategoriesResponse }>(
        GET_FIRST_LEVEL_CATEGORIES_QUERY,
        {
            skip, // Allows conditionally skipping the query
            notifyOnNetworkStatusChange: true,
        }
    );

    // This `useMemo` block processes the raw data from Apollo.
    // It will only re-run when the `data` object changes.
    const processedData = useMemo(() => {
        // If there's no data, return the default empty structure.
        if (!data?.categories?.items) {
            return { items: [] as CategoryType[] };
        }

        // Apply the same logic from your original `fetchFirstLevelCategories` function:
        // 1. Map to add an empty `children` array to match the CategoryType interface.
        // 2. Filter out categories that should not be in the menu.
        const filteredItems = data.categories.items
            .map(category => ({
                ...category,
                children: [] as CategoryType[], // Initialize children array
            }))
            .filter((category: CategoryType) => category.include_in_menu === 1);

        return { items: filteredItems };

    }, [data]); // The dependency array ensures this logic runs only when data changes.

    // This `useEffect` handles network errors by adding the refetch function to a queue.
    // This is copied directly from your `useCategories` example as it's a great pattern.
    useEffect(() => {
        if (error && setRetryQueue && !loading) {
            if (isNetworkError(error)) {
                console.error('Apollo query (useFirstLevelCategories) failed due to network. Queuing refetch.');
                
                const refetchRequest = async () => {
                    await refetch();
                };
        
                setRetryQueue(prevQueue => [...prevQueue, refetchRequest]);
            }
        }
    }, [error, loading, refetch, setRetryQueue]);

    return {
        // We return the processed and filtered data, not the raw data from the query.
        firstLevelCategories: processedData,
        loading,
        error,
        refetch,
    };
};